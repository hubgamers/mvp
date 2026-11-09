import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, CircleAlert, ShieldCheck } from "lucide-react";
import Stripe from "stripe";

type CheckoutResult = "confirmed" | "pending" | "invalid" | "unavailable";

async function getCheckoutResult(
  sessionId: string | undefined
): Promise<CheckoutResult> {
  if (!sessionId) {
    return "invalid";
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("[STRIPE_CHECKOUT_SUCCESS_ERROR] STRIPE_SECRET_KEY manquant.");
    return "unavailable";
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      session.mode !== "subscription" ||
      session.metadata?.platform !== "hubgamers"
    ) {
      return "invalid";
    }

    if (
      session.status === "complete" &&
      (session.payment_status === "paid" ||
        session.payment_status === "no_payment_required")
    ) {
      return "confirmed";
    }

    return "pending";
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_SUCCESS_ERROR]", error);
    return "unavailable";
  }
}

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#080b12]" />}>
      <CheckoutSuccessContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CheckoutSuccessContent({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const { session_id: sessionIdParam } = await searchParams;
  const sessionId =
    typeof sessionIdParam === "string" ? sessionIdParam : undefined;
  const result = await getCheckoutResult(sessionId);
  const isConfirmed = result === "confirmed";

  const headings: Record<CheckoutResult, string> = {
    confirmed: "Paiement confirmé",
    pending: "Paiement en cours",
    invalid: "Session introuvable",
    unavailable: "Confirmation indisponible",
  };
  const messages: Record<CheckoutResult, string> = {
    confirmed: "Ton abonnement HubGamers a bien été confirmé par Stripe.",
    pending:
      "Stripe n'a pas encore confirmé le paiement. Si tu viens de valider, actualise cette page dans quelques instants.",
    invalid:
      "Cette session de paiement est invalide ou ne correspond pas à un abonnement HubGamers.",
    unavailable:
      "Nous ne pouvons pas confirmer le paiement pour le moment. Vérifie ton e-mail Stripe ou réessaie plus tard.",
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b12] px-5 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-64 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute bottom-0 right-[-200px] h-[400px] w-[400px] rounded-full bg-[#ccff00]/[0.04] blur-[150px]" />
      </div>

      <section className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#101521]/90 p-8 text-center sm:p-10">
        <div
          className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${
            isConfirmed
              ? "bg-[#ccff00]/10 text-[#ccff00]"
              : "bg-amber-400/10 text-amber-300"
          }`}
        >
          {isConfirmed ? <ShieldCheck size={30} /> : <CircleAlert size={30} />}
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-[#ccff00]">
          HubGamers
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          {headings[result]}
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          {messages[result]}
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#ccff00] px-5 py-3 font-bold text-black transition hover:bg-[#dcff55]"
        >
          Retour à HubGamers
          <ArrowRight size={17} />
        </Link>
        <p className="mt-6 text-xs text-slate-500">
          {isConfirmed
            ? "Un reçu sera envoyé à l'adresse e-mail utilisée lors du paiement."
            : "En cas de débit confirmé, contacte le support HubGamers."}
        </p>
      </section>
    </main>
  );
}