import Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

function getCustomerId(customer: Stripe.Subscription["customer"]) {
  return typeof customer === "string" ? customer : customer.id;
}

export async function saveStripeSubscription(
  subscription: Stripe.Subscription,
  eventCreated: number
) {
  if (subscription.metadata.platform !== "hubgamers") {
    return;
  }

  const userId = subscription.metadata.user_id;
  const planId = subscription.metadata.plan_id;

  if (!userId || !isUuid(userId) || !planId) {
    console.error(
      `[STRIPE_SUBSCRIPTION_SYNC_ERROR] Métadonnées utilisateur ou offre absentes pour ${subscription.id}.`
    );
    return;
  }

  const item = subscription.items.data[0];
  const periodStart = item?.current_period_start;
  const periodEnd = item?.current_period_end;
  const isCurrent = !["canceled", "incomplete_expired"].includes(
    subscription.status
  );
  const data = {
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: getCustomerId(subscription.customer),
    stripe_price_id: item?.price.id ?? null,
    plan_id: planId,
    status: subscription.status,
    currency: subscription.currency,
    amount: item?.price.unit_amount ?? null,
    interval: item?.price.recurring?.interval ?? null,
    interval_count: item?.price.recurring?.interval_count ?? null,
    current_period_start: periodStart ? new Date(periodStart * 1000) : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000) : null,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000)
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    checkout_expires_at: null,
    is_current: isCurrent,
    stripe_event_created: eventCreated,
    stripe_metadata: { ...subscription.metadata },
  };

  try {
    await prisma.$transaction(async (transaction) => {
      const existing = await transaction.stripe_subscriptions.findUnique({
        where: { stripe_subscription_id: subscription.id },
      });

      if (existing) {
        if (
          existing.stripe_event_created !== null &&
          existing.stripe_event_created >= eventCreated
        ) {
          return;
        }

        await transaction.stripe_subscriptions.update({
          where: { id: existing.id },
          data,
        });
        return;
      }

      const reservation = await transaction.stripe_subscriptions.findFirst({
        where: {
          user_id: userId,
          plan_id: planId,
          is_current: true,
          stripe_subscription_id: null,
        },
      });

      if (reservation) {
        await transaction.stripe_subscriptions.update({
          where: { id: reservation.id },
          data,
        });
        return;
      }

      const existingCurrent = isCurrent
        ? await transaction.stripe_subscriptions.findFirst({
            where: {
              user_id: userId,
              plan_id: planId,
              is_current: true,
            },
            select: { id: true },
          })
        : null;

      await transaction.stripe_subscriptions.create({
        data: {
          ...data,
          is_current: isCurrent && !existingCurrent,
        },
      });
    });
  } catch (error) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== "P2002"
    ) {
      throw error;
    }

    const existing = await prisma.stripe_subscriptions.findUnique({
      where: { stripe_subscription_id: subscription.id },
    });

    if (existing) {
      if (
        existing.stripe_event_created === null ||
        existing.stripe_event_created < eventCreated
      ) {
        await prisma.stripe_subscriptions.update({
          where: { id: existing.id },
          data,
        });
      }
      return;
    }

    await prisma.stripe_subscriptions.create({
      data: { ...data, is_current: false },
    });
  }
}

export async function syncUserStripeSubscriptions(
  stripe: Stripe,
  userId: string,
  email: string
) {
  const customers = await stripe.customers.list({
    email: email.trim().toLowerCase(),
    limit: 100,
  });

  for (const customer of customers.data) {
    if (customer.deleted) continue;

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 100,
    });

    for (let subscription of subscriptions.data) {
      if (subscription.metadata.platform !== "hubgamers") continue;
      if (
        subscription.metadata.user_id &&
        subscription.metadata.user_id !== userId
      ) {
        continue;
      }

      if (!subscription.metadata.user_id) {
        subscription = await stripe.subscriptions.update(subscription.id, {
          metadata: {
            ...subscription.metadata,
            user_id: userId,
          },
        });
      }

      await saveStripeSubscription(subscription, Math.floor(Date.now() / 1000));
    }
  }
}
