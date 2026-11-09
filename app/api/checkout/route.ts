
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  saveStripeSubscription,
  syncUserStripeSubscriptions,
} from "@/lib/stripe-subscriptions";
import { createClient } from "@/utils/supabase/server";

const priceMapping: Record<string, string | undefined> = {
  "player-plus": process.env.STRIPE_PRICE_PLAYER_PLUS,
  "player-pro": process.env.STRIPE_PRICE_PLAYER_PRO,

  "organizer-plus": process.env.STRIPE_PRICE_ORGANIZER_PLUS,
  "organizer-pro": process.env.STRIPE_PRICE_ORGANIZER_PRO,

  "club-plus": process.env.STRIPE_PRICE_CLUB_PLUS,
  "club-pro": process.env.STRIPE_PRICE_CLUB_PRO,

  "studio-plus": process.env.STRIPE_PRICE_STUDIO_PLUS,
  "studio-pro": process.env.STRIPE_PRICE_STUDIO_PRO,
};

const planCategories: Record<string, string> = {
  "player-plus": "player",
  "player-pro": "player",
  "organizer-plus": "organizer",
  "organizer-pro": "organizer",
  "club-plus": "club",
  "club-pro": "club",
  "studio-plus": "studio",
  "studio-pro": "studio",
};

class ExistingSubscriptionError extends Error {}
class SubscriptionChangeUnavailableError extends Error {}
class SubscriptionChangePaymentError extends Error {}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Le contenu de la requête est invalide." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Informations invalides." },
      { status: 400 }
    );
  }

  const { planId, email, firstName, lastName, changePlan } = body as Record<
    string,
    unknown
  >;

  if (
    typeof planId !== "string" ||
    (email !== undefined && typeof email !== "string") ||
    (firstName !== undefined && typeof firstName !== "string") ||
    (lastName !== undefined && typeof lastName !== "string") ||
    (changePlan !== undefined && typeof changePlan !== "boolean")
  ) {
    return NextResponse.json(
      { error: "Informations invalides." },
      { status: 400 }
    );
  }

  const hasCheckoutDetails =
    typeof email === "string" &&
    typeof firstName === "string" &&
    typeof lastName === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    Boolean(firstName.trim()) &&
    Boolean(lastName.trim());
  if (
    [email, firstName, lastName].some((value) => value !== undefined) &&
    !hasCheckoutDetails
  ) {
    return NextResponse.json(
      { error: "Informations invalides." },
      { status: 400 }
    );
  }

  if (!Object.hasOwn(priceMapping, planId)) {
    return NextResponse.json(
      { error: "Cette offre n'est pas disponible." },
      { status: 400 }
    );
  }

  const priceId = priceMapping[planId];
  const category = planCategories[planId];

  if (!priceId || !category) {
    console.error(`[STRIPE_CHECKOUT_CONFIG_ERROR] Prix manquant pour ${planId}`);
    return NextResponse.json(
      { error: "Cette offre n'est pas disponible pour le moment." },
      { status: 500 }
    );
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!secretKey || !configuredAppUrl) {
    console.error("[STRIPE_CHECKOUT_CONFIG_ERROR] Configuration Stripe manquante.");
    return NextResponse.json(
      { error: "Le paiement n'est pas configuré pour le moment." },
      { status: 500 }
    );
  }

  let appUrl: URL;
  try {
    appUrl = new URL(configuredAppUrl);
  } catch {
    console.error("[STRIPE_CHECKOUT_CONFIG_ERROR] NEXT_PUBLIC_APP_URL invalide.");
    return NextResponse.json(
      { error: "Le paiement n'est pas configuré pour le moment." },
      { status: 500 }
    );
  }

  if (appUrl.protocol !== "https:" && appUrl.protocol !== "http:") {
    console.error("[STRIPE_CHECKOUT_CONFIG_ERROR] NEXT_PUBLIC_APP_URL invalide.");
    return NextResponse.json(
      { error: "Le paiement n'est pas configuré pour le moment." },
      { status: 500 }
    );
  }

  try {
    const stripe = new Stripe(secretKey);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json(
        { error: "Connecte-toi pour souscrire à une offre." },
        { status: 401 }
      );
    }

    if (
      hasCheckoutDetails &&
      user.email.trim().toLowerCase() !== email.trim().toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "Utilise l'adresse e-mail associée à ton compte HubGamers.",
        },
        { status: 400 }
      );
    }

    const profile = await prisma.users.findUnique({
      where: { id: user.id },
      select: { id: true },
    });
    if (!profile) {
      return NextResponse.json(
        { error: "Ton profil HubGamers est introuvable." },
        { status: 404 }
      );
    }

    await syncUserStripeSubscriptions(
      stripe,
      user.id,
      user.email.trim().toLowerCase()
    );

    await prisma.stripe_subscriptions.updateMany({
      where: {
        user_id: user.id,
        is_current: true,
        plan_id: { startsWith: `${category}-` },
        stripe_subscription_id: null,
        checkout_expires_at: { lte: new Date() },
      },
      data: { is_current: false, status: "checkout_expired" },
    });

    const categorySubscriptions =
      await prisma.stripe_subscriptions.findMany({
        where: {
          user_id: user.id,
          is_current: true,
          plan_id: { startsWith: `${category}-` },
        },
        orderBy: { created_at: "desc" },
      });

    const pendingCheckout = categorySubscriptions.find(
      (subscription) =>
        !subscription.stripe_subscription_id &&
        subscription.checkout_expires_at &&
        subscription.checkout_expires_at > new Date()
    );
    if (pendingCheckout) {
      throw new ExistingSubscriptionError();
    }

    const managedSubscriptions: Stripe.Subscription[] = [];
    for (const localSubscription of categorySubscriptions) {
      if (!localSubscription.stripe_subscription_id) continue;

      const subscription = await stripe.subscriptions.retrieve(
        localSubscription.stripe_subscription_id
      );
      if (
        subscription.metadata.platform === "hubgamers" &&
        subscription.metadata.user_id === user.id &&
        subscription.metadata.subscription_type === category &&
        planCategories[subscription.metadata.plan_id] === category &&
        !["canceled", "incomplete_expired"].includes(subscription.status)
      ) {
        managedSubscriptions.push(subscription);
      }
    }

    if (managedSubscriptions.length) {
      const activeSubscriptions = managedSubscriptions.filter((subscription) =>
        ["active", "trialing"].includes(subscription.status)
      );
      if (!activeSubscriptions.length) {
        throw new SubscriptionChangeUnavailableError();
      }

      const currentSubscription = activeSubscriptions[0];
      if (currentSubscription.metadata.plan_id === planId) {
        throw new ExistingSubscriptionError();
      }

      const currentItem = currentSubscription.items.data[0];
      if (!currentItem) {
        throw new SubscriptionChangeUnavailableError();
      }

      let updatedSubscription: Stripe.Subscription;
      try {
        updatedSubscription = await stripe.subscriptions.update(
          currentSubscription.id,
          {
            items: [{ id: currentItem.id, price: priceId }],
            proration_behavior: "always_invoice",
            payment_behavior: "error_if_incomplete",
            cancel_at_period_end: false,
            metadata: {
              ...currentSubscription.metadata,
              plan_id: planId,
              subscription_type: category,
            },
          }
        );
      } catch (error) {
        if (
          error instanceof Stripe.errors.StripeError &&
          error.statusCode === 402
        ) {
          throw new SubscriptionChangePaymentError();
        }
        throw error;
      }

      await saveStripeSubscription(
        updatedSubscription,
        Math.floor(Date.now() / 1000)
      );

      for (const duplicateSubscription of managedSubscriptions.filter(
        (subscription) => subscription.id !== currentSubscription.id
      )) {
        const canceledSubscription = await stripe.subscriptions.cancel(
          duplicateSubscription.id,
          { prorate: true }
        );
        await saveStripeSubscription(
          canceledSubscription,
          Math.floor(Date.now() / 1000)
        );
      }

      return NextResponse.json({ updated: true });
    }

    if (changePlan) {
      throw new SubscriptionChangeUnavailableError();
    }
    if (!hasCheckoutDetails) {
      return NextResponse.json(
        { error: "Informations du compte manquantes." },
        { status: 400 }
      );
    }

    const reservation = await prisma.$transaction(async (transaction) => {
      const now = new Date();
      await transaction.stripe_subscriptions.updateMany({
        where: {
          user_id: user.id,
          plan_id: planId,
          is_current: true,
          stripe_subscription_id: null,
          checkout_expires_at: { lte: now },
        },
        data: {
          is_current: false,
          status: "checkout_expired",
        },
      });

      const existingSubscription =
        await transaction.stripe_subscriptions.findFirst({
          where: {
            user_id: user.id,
            plan_id: planId,
            is_current: true,
          },
          select: { id: true },
        });

      if (existingSubscription) {
        throw new ExistingSubscriptionError();
      }

      const reservation = await transaction.stripe_subscriptions.create({
        data: {
          user_id: user.id,
          plan_id: planId,
          status: "checkout_pending",
          is_current: true,
          checkout_expires_at: new Date(now.getTime() + 15 * 60 * 1000),
        },
        select: { id: true },
      });
      return reservation;
    });

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: user.email.trim().toLowerCase(),
        billing_address_collection: "required",
        automatic_tax: {
          enabled: true,
        },
        tax_id_collection: {
          enabled: true,
        },
        metadata: {
          platform: "hubgamers",
          plan_id: planId,
          subscription_type: category,
          user_id: user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
        subscription_data: {
          metadata: {
            platform: "hubgamers",
            plan_id: planId,
            subscription_type: category,
            user_id: user.id,
          },
        },
        success_url: new URL(
          `/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          appUrl
        ).toString(),
        cancel_url: new URL(
          `/checkout?plan=${encodeURIComponent(planId)}`,
          appUrl
        ).toString(),
      });
    } catch (error) {
      await prisma.stripe_subscriptions.update({
        where: { id: reservation.id },
        data: { status: "checkout_failed", is_current: false },
      });
      throw error;
    }

    if (!session.url) {
      await prisma.stripe_subscriptions.update({
        where: { id: reservation.id },
        data: { status: "checkout_failed", is_current: false },
      });
      throw new Error("Stripe n'a pas retourné d'URL de paiement.");
    }

    await prisma.stripe_subscriptions.update({
      where: { id: reservation.id },
      data: {
        stripe_checkout_session_id: session.id,
        stripe_customer_id:
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id,
        checkout_expires_at: session.expires_at
          ? new Date(session.expires_at * 1000)
          : null,
        checkout_metadata: session.metadata ?? {},
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof SubscriptionChangePaymentError) {
      return NextResponse.json(
        {
          error:
            "Le paiement de la différence a été refusé ou nécessite une authentification. Ton abonnement actuel n'a pas été modifié. Mets à jour ton moyen de paiement depuis l'espace de facturation, puis réessaie.",
          code: "SUBSCRIPTION_CHANGE_PAYMENT_FAILED",
        },
        { status: 402 }
      );
    }

    if (error instanceof SubscriptionChangeUnavailableError) {
      return NextResponse.json(
        {
          error:
            "Impossible de trouver un abonnement actif à modifier. Actualise les offres puis réessaie.",
          code: "SUBSCRIPTION_CHANGE_UNAVAILABLE",
        },
        { status: 409 }
      );
    }

    if (error instanceof ExistingSubscriptionError) {
      return NextResponse.json(
        {
          error:
            "Tu as déjà cette offre active ou en cours de souscription.",
          code: "SUBSCRIPTION_ALREADY_ACTIVE",
        },
        { status: 409 }
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "Tu as déjà cette offre active ou en cours de souscription.",
          code: "SUBSCRIPTION_ALREADY_ACTIVE",
        },
        { status: 409 }
      );
    }

    console.error("[STRIPE_CHECKOUT_ERROR]", error);

    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création du paiement." },
      { status: 500 }
    );
  }
}
