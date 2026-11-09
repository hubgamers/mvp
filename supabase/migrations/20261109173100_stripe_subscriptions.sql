CREATE TABLE "stripe_subscriptions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "stripe_subscription_id" VARCHAR,
  "stripe_checkout_session_id" VARCHAR,
  "stripe_customer_id" VARCHAR,
  "stripe_price_id" VARCHAR,
  "plan_id" VARCHAR NOT NULL,
  "status" VARCHAR NOT NULL,
  "currency" VARCHAR,
  "amount" INTEGER,
  "interval" VARCHAR,
  "interval_count" INTEGER,
  "current_period_start" TIMESTAMP(6),
  "current_period_end" TIMESTAMP(6),
  "trial_start" TIMESTAMP(6),
  "trial_end" TIMESTAMP(6),
  "canceled_at" TIMESTAMP(6),
  "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
  "checkout_expires_at" TIMESTAMP(6),
  "is_current" BOOLEAN NOT NULL DEFAULT true,
  "stripe_event_created" INTEGER,
  "stripe_metadata" JSONB NOT NULL DEFAULT '{}',
  "checkout_metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stripe_subscriptions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "stripe_subscriptions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX "stripe_subscriptions_stripe_subscription_id_key"
  ON "stripe_subscriptions"("stripe_subscription_id");

CREATE UNIQUE INDEX "stripe_subscriptions_stripe_checkout_session_id_key"
  ON "stripe_subscriptions"("stripe_checkout_session_id");

CREATE UNIQUE INDEX "stripe_subscriptions_one_current_plan_per_user"
  ON "stripe_subscriptions"("user_id", "plan_id")
  WHERE "is_current" = true;

CREATE INDEX "stripe_subscriptions_user_id_is_current_idx"
  ON "stripe_subscriptions"("user_id", "is_current");

CREATE INDEX "stripe_subscriptions_user_id_plan_id_current_period_end_idx"
  ON "stripe_subscriptions"("user_id", "plan_id", "current_period_end");
