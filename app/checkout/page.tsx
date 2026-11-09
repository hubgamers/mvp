
"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShieldCheck,
  LockKeyhole,
  CreditCard,
  Sparkles,
  Gamepad2,
  Trophy,
  Building2,
  Radio,
  Loader2,
  Info,
} from "lucide-react";

type Plan = {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  price: number;
  description: string;
  features: string[];
};

const plans: Record<string, Plan> = {
  "player-plus": {
    id: "player-plus",
    name: "Player Plus",
    category: "player",
    categoryLabel: "Joueur",
    price: 3.99,
    description: "Développe ton expérience de joueur.",
    features: [
      "15 squads maximum",
      "Personnalisation du profil",
      "Badges et cosmétiques",
      "Filtres avancés",
      "Favoris et suivi des annonces",
      "Notifications personnalisables",
    ],
  },
  "player-pro": {
    id: "player-pro",
    name: "Player Pro",
    category: "player",
    categoryLabel: "Joueur",
    price: 7.99,
    description: "L'expérience complète pour les joueurs actifs.",
    features: [
      "25 squads maximum",
      "Toutes les fonctionnalités Plus",
      "Mise en avant du profil",
      "Mise en avant des annonces",
    ],
  },
  "organizer-plus": {
    id: "organizer-plus",
    name: "Organizer Plus",
    category: "organizer",
    categoryLabel: "Organisateur",
    price: 19,
    description: "Développe tes compétitions.",
    features: [
      "3 tournois actifs",
      "32 équipes maximum",
      "5 phases maximum",
      "5 arbitres maximum",
      "5 overlays maximum",
      "Personnalisation des tournois",
      "Gestion des streams officiels",
    ],
  },
  "organizer-pro": {
    id: "organizer-pro",
    name: "Organizer Pro",
    category: "organizer",
    categoryLabel: "Organisateur",
    price: 49,
    description: "Des outils avancés pour tes événements.",
    features: [
      "10 tournois actifs",
      "64 équipes maximum",
      "15 arbitres maximum",
      "10 overlays maximum",
      "Personnalisation avancée des overlays",
      "Branding supplémentaire",
    ],
  },
  "club-plus": {
    id: "club-plus",
    name: "Club Plus",
    category: "club",
    categoryLabel: "Club",
    price: 19,
    description: "Développe et structure ton organisation.",
    features: [
      "5 line-up maximum",
      "50 membres maximum",
      "Recrutement de joueurs",
      "Gestion des candidatures",
      "Personnalisation de la page publique",
    ],
  },
  "club-pro": {
    id: "club-pro",
    name: "Club Pro",
    category: "club",
    categoryLabel: "Club",
    price: 39,
    description: "La solution pour les organisations ambitieuses.",
    features: [
      "15 line-up maximum",
      "150 membres maximum",
      "Toutes les fonctionnalités Plus",
    ],
  },
  "studio-plus": {
    id: "studio-plus",
    name: "Studio Plus",
    category: "studio",
    categoryLabel: "Studio",
    price: 9,
    description: "Personnalise tes productions.",
    features: [
      "5 overlays maximum",
      "Personnalisation des overlays",
      "Affichage des sponsors et casters",
      "Branding HubGamers réduit",
    ],
  },
  "studio-pro": {
    id: "studio-pro",
    name: "Studio Pro",
    category: "studio",
    categoryLabel: "Studio",
    price: 19,
    description: "Une expérience de production professionnelle.",
    features: [
      "15 overlays maximum",
      "Personnalisation avancée",
      "Suppression du branding HubGamers",
    ],
  },
};

const categoryIcons = {
  player: Gamepad2,
  organizer: Trophy,
  club: Building2,
  studio: Radio,
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const planId = searchParams.get("plan") ?? "";
  const isPlanChange = searchParams.get("change") === "1";
  const plan = useMemo(() => plans[planId], [planId]);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!plan) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b12] px-5 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
            <Info className="text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold">Offre introuvable</h1>
          <p className="mt-3 text-sm text-slate-400">
            Cette offre n'existe pas ou n'est plus disponible.
          </p>
          <Link
            href="/pricing"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#ccff00] px-5 py-3 font-bold text-black"
          >
            Voir les offres
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  const Icon = categoryIcons[plan.category as keyof typeof categoryIcons];

  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("Tu dois accepter les conditions de vente pour continuer.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          changePlan: isPlanChange,
          ...(isPlanChange ? {} : { email, firstName, lastName }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de créer le paiement.");
      }

      if (data.updated) {
        router.replace("/dashboard/billing");
        router.refresh();
        return;
      }

      if (!data.url) {
        throw new Error("URL de paiement Stripe introuvable.");
      }

      window.location.assign(data.url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur inattendue est survenue."
      );
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b12] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-64 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute bottom-0 right-[-200px] h-[400px] w-[400px] rounded-full bg-[#ccff00]/[0.04] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between border-b border-white/[0.07] pb-6">
          <Link
            href="/"
            className="text-xl font-black tracking-tight"
          >
            HUB<span className="text-[#ccff00]">GAMERS</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <LockKeyhole size={14} className="text-[#ccff00]" />
            Paiement sécurisé
          </div>
        </nav>

        {/* Header */}
        <div className="mb-10 mt-12">
          <Link
            href="/pricing"
            className="mb-7 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Retour aux offres
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#ccff00]/20 bg-[#ccff00]/10 text-[#ccff00]">
              <Sparkles size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                {isPlanChange
                  ? "Confirme le changement d'offre."
                  : "Finalise ton abonnement."}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {isPlanChange
                  ? "Ton abonnement sera modifié immédiatement. Stripe calculera la différence au prorata et la débitera sur ton moyen de paiement enregistré."
                  : "Quelques informations avant de rejoindre l'expérience premium."}
              </p>
            </div>
          </div>
        </div>

        {/* Checkout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Form */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#101521]/90 p-6 sm:p-8">
            <form onSubmit={handleCheckout}>
              {/* Account */}
              {!isPlanChange && (
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ccff00]/10 text-sm font-bold text-[#ccff00]">
                      01
                    </span>
                    <div>
                      <h2 className="font-bold">Informations du compte</h2>
                      <p className="text-xs text-slate-500">
                        Les informations nécessaires à ton abonnement.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="mb-2 block text-sm font-medium text-slate-300"
                      >
                        Prénom
                      </label>
                      <input
                        id="firstName"
                        required
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Alexis"
                        className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-[#ccff00]/60"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="mb-2 block text-sm font-medium text-slate-300"
                      >
                        Nom
                      </label>
                      <input
                        id="lastName"
                        required
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Dupont"
                        className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-[#ccff00]/60"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Adresse e-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alexis@exemple.fr"
                      className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-[#ccff00]/60"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Utilise l'adresse e-mail associée à ton compte HubGamers.
                    </p>
                  </div>
                </div>
              )}

              {!isPlanChange && (
                <div className="my-8 border-t border-white/[0.07]" />
              )}

              {/* Billing */}
              {!isPlanChange ? (
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ccff00]/10 text-sm font-bold text-[#ccff00]">
                      02
                    </span>
                    <div>
                      <h2 className="font-bold">Facturation et paiement</h2>
                      <p className="text-xs text-slate-500">
                        Le paiement sera traité par Stripe.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <CreditCard className="mt-0.5 text-[#ccff00]" size={20} />
                    <div>
                      <p className="text-sm font-semibold">
                        Paiement sécurisé Stripe
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Tu seras redirigé vers Stripe pour saisir tes
                        coordonnées de facturation et choisir ton moyen
                        de paiement. Aucune donnée bancaire n'est stockée
                        par HubGamers.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[#ccff00]/20 bg-[#ccff00]/[0.04] p-4 text-sm leading-6 text-slate-300">
                  Le passage à {plan.name} prend effet dès la confirmation. Le
                  paiement de la différence est traité par Stripe avec le moyen
                  de paiement enregistré. Si le paiement échoue, ton offre
                  actuelle reste inchangée.
                </div>
              )}

              {!isPlanChange && (
                <div className="my-8 border-t border-white/[0.07]" />
              )}

              {/* Terms */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#ccff00]"
                />
                <span className="text-xs leading-5 text-slate-400">
                  J'accepte les{" "}
                  <Link
                    href="/cgu"
                    target="_blank"
                    className="text-[#ccff00] hover:underline"
                  >
                    conditions générales de vente
                  </Link>{" "}
                  et les{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-[#ccff00] hover:underline"
                  >
                    conditions de confidentialité
                  </Link>
                  .
                </span>
              </label>

              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
                >
                  {error}
                  {error.includes("Connecte-toi") && (
                    <Link
                      href="/login"
                      className="ml-2 font-semibold text-white underline"
                    >
                      Se connecter
                    </Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !acceptedTerms}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ccff00] px-5 py-4 text-sm font-black text-[#10140a] transition hover:bg-[#dcff55] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {isPlanChange
                      ? "Mise à jour de l'abonnement..."
                      : "Préparation du paiement..."}
                  </>
                ) : (
                  <>
                    {isPlanChange
                      ? "Confirmer le changement d'offre"
                      : "Continuer vers le paiement"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={14} />
                Paiement protégé par Stripe
              </p>
            </form>
          </section>

          {/* Summary */}
          <aside className="h-fit rounded-2xl border border-white/[0.08] bg-[#101521]/90 p-6 sm:p-7 lg:sticky lg:top-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-bold">Récapitulatif</h2>
              <span className="rounded-full border border-[#ccff00]/20 bg-[#ccff00]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ccff00]">
                Abonnement
              </span>
            </div>

            <div className="rounded-xl border border-[#ccff00]/20 bg-[#ccff00]/[0.04] p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ccff00]/10 text-[#ccff00]">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">
                    {plan.categoryLabel}
                  </p>
                  <h3 className="font-bold">{plan.name}</h3>
                </div>
              </div>

              <p className="text-xs leading-5 text-slate-400">
                {plan.description}
              </p>

              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-3xl font-black">
                  {formatPrice(plan.price)}
                  <span className="ml-1 text-sm font-normal text-slate-500">
                    / mois
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Facturation récurrente mensuelle
                </p>
              </div>
            </div>

            <div className="my-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Ton abonnement comprend
              </p>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <Check
                      size={15}
                      className="mt-0.5 shrink-0 text-[#ccff00]"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-white/[0.07] pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  {isPlanChange ? "Nouveau tarif mensuel" : "Sous-total mensuel"}
                </span>
                <span>{formatPrice(plan.price)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-400">Taxes</span>
                <span className="text-slate-500">
                  Calculées par Stripe
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-5">
                <span className="font-bold">
                  {isPlanChange ? "Nouveau tarif mensuel" : "Total mensuel"}
                </span>
                <span className="text-xl font-black text-[#ccff00]">
                  {formatPrice(plan.price)}
                </span>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-slate-500">
                {isPlanChange
                  ? "Le montant immédiat de la différence sera calculé au prorata par Stripe et apparaîtra sur la facture."
                  : "Le montant définitif, incluant les taxes applicables, sera affiché avant la validation du paiement sur Stripe."}
              </p>
            </div>

            <div className="mt-6 flex items-start gap-2 rounded-xl bg-white/[0.03] p-3">
              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0 text-emerald-400"
              />
              <p className="text-[11px] leading-5 text-slate-500">
                Ton abonnement pourra être géré et résilié depuis ton espace
                personnel, selon les conditions applicables.
              </p>
            </div>
          </aside>
        </div>

        <footer className="mt-12 border-t border-white/[0.07] pt-6 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} HubGamers. Tous droits réservés.
        </footer>
      </div>
    </main>
  );
}
