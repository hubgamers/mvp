import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { syncUserStripeSubscriptions } from "@/lib/stripe-subscriptions";
import { createClient } from "@/utils/supabase/server";

const planNames: Record<string, string> = {
  "player-plus": "Player Plus",
  "player-pro": "Player Pro",
  "organizer-plus": "Organizer Plus",
  "organizer-pro": "Organizer Pro",
  "club-plus": "Club Plus",
  "club-pro": "Club Pro",
  "studio-plus": "Studio Plus",
  "studio-pro": "Studio Pro",
};

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY manquant.");
  }

  return new Stripe(secretKey);
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.email) {
      return NextResponse.json(
        { error: "Connecte-toi pour consulter ta facturation." },
        { status: 401 }
      );
    }

    const stripe = getStripeClient();
    await syncUserStripeSubscriptions(stripe, user.id, user.email);

    const subscriptions = await prisma.stripe_subscriptions.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
    });
    const customerIds = [
      ...new Set(
        subscriptions
          .map((subscription) => subscription.stripe_customer_id)
          .filter((customerId): customerId is string => Boolean(customerId))
      ),
    ];

    const invoicesByCustomer = await Promise.all(
      customerIds.map(async (customerId) => {
        const invoices = await stripe.invoices.list({
          customer: customerId,
          limit: 100,
        });
        return invoices.data.map((invoice) => ({
          id: invoice.id,
          number: invoice.number,
          created: invoice.created,
          amountPaid: invoice.amount_paid,
          amountDue: invoice.amount_due,
          currency: invoice.currency,
          status: invoice.status,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          invoicePdf: invoice.invoice_pdf,
        }));
      })
    );

    return NextResponse.json({
      customers: customerIds.map((customerId) => ({ customerId })),
      subscriptions: subscriptions.map((subscription) => ({
        id: subscription.id,
        customerId: subscription.stripe_customer_id,
        name: planNames[subscription.plan_id] ?? "Abonnement HubGamers",
        planId: subscription.plan_id,
        status: subscription.status,
        currency: subscription.currency ?? "eur",
        amount: subscription.amount,
        interval: subscription.interval,
        intervalCount: subscription.interval_count ?? 1,
        currentPeriodStart: subscription.current_period_start
          ? Math.floor(subscription.current_period_start.getTime() / 1000)
          : null,
        currentPeriodEnd: subscription.current_period_end
          ? Math.floor(subscription.current_period_end.getTime() / 1000)
          : null,
        trialStart: subscription.trial_start
          ? Math.floor(subscription.trial_start.getTime() / 1000)
          : null,
        trialEnd: subscription.trial_end
          ? Math.floor(subscription.trial_end.getTime() / 1000)
          : null,
        canceledAt: subscription.canceled_at
          ? Math.floor(subscription.canceled_at.getTime() / 1000)
          : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        isCurrent: subscription.is_current,
        metadata: subscription.stripe_metadata,
      })),
      invoices: invoicesByCustomer
        .flat()
        .sort((a, b) => b.created - a.created),
    });
  } catch (error) {
    console.error("[STRIPE_BILLING_SYNC_ERROR]", error);
    return NextResponse.json(
      { error: "Impossible de synchroniser les données de facturation." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "La requête est invalide." },
      { status: 400 }
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("customerId" in body) ||
    typeof body.customerId !== "string"
  ) {
    return NextResponse.json(
      { error: "Client de facturation invalide." },
      { status: 400 }
    );
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Connecte-toi pour gérer ton abonnement." },
        { status: 401 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL manquant.");
    }

    const returnUrl = new URL("/dashboard/billing", appUrl);
    if (returnUrl.protocol !== "https:" && returnUrl.protocol !== "http:") {
      throw new Error("NEXT_PUBLIC_APP_URL invalide.");
    }

    const subscription = await prisma.stripe_subscriptions.findFirst({
      where: {
        user_id: user.id,
        stripe_customer_id: body.customerId,
      },
      select: { stripe_customer_id: true },
    });
    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Client de facturation introuvable." },
        { status: 404 }
      );
    }

    const session = await getStripeClient().billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl.toString(),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[STRIPE_BILLING_PORTAL_ERROR]", error);
    return NextResponse.json(
      { error: "Impossible d'ouvrir le portail de facturation." },
      { status: 500 }
    );
  }
}
