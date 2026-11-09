This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Stripe subscriptions

Apply `supabase/migrations/20261109173100_stripe_subscriptions.sql` to the database and set `STRIPE_WEBHOOK_SECRET` alongside the Stripe API and price environment variables. Configure a Stripe webhook to call `/api/webhooks/stripe` for `checkout.session.completed`, `checkout.session.expired`, and `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`.

## Espace d'administration

Configurez `ADMIN_EMAIL` avec l'adresse e-mail exacte du compte Supabase autorisé, puis appliquez la migration `supabase/migrations/20261109182500_admin_crm_tasks.sql`. L'espace privé est accessible sous `/dashboard/admin` et comprend le CRM des utilisateurs ainsi qu'un tableau de tâches. Les routes et actions vérifient l'adresse côté serveur.

La console admin comprend aussi un explorateur paginé en lecture seule des tables `public` et `admin`, ainsi qu'un tableau de bord des abonnements synchronisés par Stripe. Les résiliations depuis ce tableau de bord sont programmées en fin de période et peuvent être annulées avant l'échéance. Configurez les webhooks Stripe vers `/api/webhooks/stripe` pour maintenir les statuts à jour.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
