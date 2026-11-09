import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { saveStripeSubscription } from "@/lib/stripe-subscriptions";

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!signature || !webhookSecret || !secretKey) {
    console.error("[STRIPE_WEBHOOK_CONFIG_ERROR] Configuration webhook manquante.");
    return NextResponse.json(
      { error: "Webhook Stripe non configuré." },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(secretKey);
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_SIGNATURE_ERROR]", error);
    return NextResponse.json(
      { error: "Signature Stripe invalide." },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        {
          const eventSubscription = event.data.object as Stripe.Subscription;
          const stripe = new Stripe(secretKey);
          const subscription = await stripe.subscriptions.retrieve(
            eventSubscription.id
          );
          await saveStripeSubscription(subscription, event.created);
        }
        break;

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (
          session.metadata?.platform !== "hubgamers" ||
          !subscriptionId
        ) {
          break;
        }

        const stripe = new Stripe(secretKey);
        let subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );
        const sessionUserId = session.metadata.user_id;

        if (
          sessionUserId &&
          isUuid(sessionUserId) &&
          !subscription.metadata.user_id
        ) {
          subscription = await stripe.subscriptions.update(subscription.id, {
            metadata: {
              ...subscription.metadata,
              platform: "hubgamers",
              plan_id: session.metadata.plan_id ?? "",
              subscription_type: session.metadata.subscription_type ?? "",
              user_id: sessionUserId,
            },
          });
        }

        await saveStripeSubscription(subscription, event.created);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await prisma.stripe_subscriptions.updateMany({
          where: {
            stripe_checkout_session_id: session.id,
            stripe_subscription_id: null,
            is_current: true,
          },
          data: {
            status: "checkout_expired",
            is_current: false,
            checkout_expires_at: new Date(session.expires_at * 1000),
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_PROCESSING_ERROR]", error);
    return NextResponse.json(
      { error: "Impossible de synchroniser l'événement Stripe." },
      { status: 500 }
    );
  }
}
