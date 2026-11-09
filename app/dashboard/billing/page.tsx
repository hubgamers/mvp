
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  CircleCheck,
  Crown,
  CreditCard,
  ExternalLink,
  FileText,
  Gamepad2,
  Building2,
  Loader2,
  RefreshCw,
  Trophy,
  Radio,
  Sparkles,
  Zap,
  ShieldCheck,
  Users,
  Layers3,
  Headset,
} from "lucide-react";

type Category = "player" | "organizer" | "club" | "studio";

type Plan = {
  name: string;
  price: number | null;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  cta: string;
  enterprise?: boolean;
};

type PricingCategory = {
  id: Category;
  label: string;
  description: string;
  icon: typeof Gamepad2;
  plans: Plan[];
};

const pricingCategories: PricingCategory[] = [
  {
    id: "player",
    label: "Joueurs",
    description: "Tout ce qu'il faut pour trouver des coéquipiers et développer ta présence.",
    icon: Gamepad2,
    plans: [
      {
        name: "Starter",
        price: 0,
        description: "Pour découvrir HubGamers et rejoindre tes premières squads.",
        cta: "Commencer gratuitement",
        features: [
          "Profil public de joueur",
          "Créer jusqu'à 5 squads",
          "Rejoindre jusqu'à 5 squads",
        ],
      },
      {
        name: "Plus",
        price: 3.99,
        description: "Pour les joueurs qui souhaitent aller plus loin.",
        cta: "Choisir Player Plus",
        highlighted: true,
        badge: "Populaire",
        features: [
          "Tout ce qui est inclus dans Starter",
          "Créer et rejoindre jusqu'à 15 squads",
          "Personnalisation du profil public",
          "Badges et cosmétiques",
          "Filtres avancés de recherche",
          "Favoris et suivi des annonces",
          "Historique des conversations",
          "Notifications personnalisables",
        ],
      },
      {
        name: "Pro",
        price: 7.99,
        description: "Pour les joueurs les plus actifs de la communauté.",
        cta: "Choisir Player Pro",
        features: [
          "Tout ce qui est inclus dans Plus",
          "Créer et rejoindre jusqu'à 25 squads",
          "Mise en avant du profil",
          "Mise en avant des annonces",
        ],
      },
    ],
  },
  {
    id: "organizer",
    label: "Organisateurs",
    description: "Les outils nécessaires pour organiser, gérer et diffuser tes compétitions.",
    icon: Trophy,
    plans: [
      {
        name: "Starter",
        price: 0,
        description: "Pour lancer tes premières compétitions.",
        cta: "Créer mon tournoi",
        features: [
          "1 tournoi actif",
          "16 équipes maximum",
          "2 phases maximum",
          "Phases de poules et brackets standards",
          "Ajout d'un arbitre",
          "Inscriptions et check-in",
          "Gestion des matchs et des scores",
          "Gestion des litiges",
          "Messagerie des matchs",
          "Association à un studio",
          "1 overlay standard avec branding HubGamers",
        ],
      },
      {
        name: "Plus",
        price: 19,
        description: "Pour les organisateurs qui développent leurs compétitions.",
        cta: "Choisir Organizer Plus",
        highlighted: true,
        badge: "Recommandé",
        features: [
          "Tout ce qui est inclus dans Starter",
          "3 tournois actifs",
          "32 équipes maximum par tournoi",
          "5 phases maximum",
          "Tous les types de phases disponibles",
          "Jusqu'à 5 arbitres",
          "Jusqu'à 5 overlays",
          "Personnalisation du tournoi",
          "Affichage des sponsors et casters",
          "Gestion des streams officiels",
        ],
      },
      {
        name: "Pro",
        price: 49,
        description: "Pour les structures qui organisent des événements à grande échelle.",
        cta: "Choisir Organizer Pro",
        features: [
          "Tout ce qui est inclus dans Plus",
          "10 tournois actifs maximum",
          "64 équipes maximum par tournoi",
          "Jusqu'à 15 arbitres",
          "Jusqu'à 10 overlays",
          "Personnalisation avancée des overlays",
          "Option de branding supplémentaire",
        ],
      },
      {
        name: "Enterprise",
        price: null,
        description: "Une solution adaptée aux grandes organisations et aux événements majeurs.",
        cta: "Contacter notre équipe",
        enterprise: true,
        features: [
          "Capacités et quotas personnalisés",
          "Tournois et configurations sur mesure",
          "White Label avancé",
          "Nom de domaine personnalisé",
          "Personnalisation graphique complète",
          "Intégrations spécifiques",
          "Accompagnement dédié",
        ],
      },
    ],
  },
  {
    id: "club",
    label: "Clubs",
    description: "Centralise tes équipes, tes membres et ton recrutement au même endroit.",
    icon: Building2,
    plans: [
      {
        name: "Starter",
        price: 0,
        description: "Pour créer ta structure et commencer à recruter.",
        cta: "Créer mon club",
        features: [
          "1 structure",
          "1 line-up",
          "10 membres maximum",
          "Inscriptions aux tournois",
          "Page publique de club",
        ],
      },
      {
        name: "Plus",
        price: 19,
        description: "Pour les clubs qui développent plusieurs équipes.",
        cta: "Choisir Club Plus",
        highlighted: true,
        badge: "Populaire",
        features: [
          "Tout ce qui est inclus dans Starter",
          "Jusqu'à 5 line-up",
          "Jusqu'à 50 membres",
          "Recrutement de joueurs",
          "Gestion des candidatures",
          "Personnalisation de la page publique",
        ],
      },
      {
        name: "Pro",
        price: 39,
        description: "Pour les organisations multi-équipes.",
        cta: "Choisir Club Pro",
        features: [
          "Tout ce qui est inclus dans Plus",
          "Jusqu'à 15 line-up",
          "Jusqu'à 150 membres",
        ],
      },
      {
        name: "Enterprise",
        price: null,
        description: "Pour les structures ayant des besoins spécifiques.",
        cta: "Contacter notre équipe",
        enterprise: true,
        features: [
          "Limites personnalisées",
          "Configuration adaptée à votre organisation",
          "Intégrations spécifiques",
          "Accompagnement dédié",
        ],
      },
    ],
  },
  {
    id: "studio",
    label: "Studio",
    description: "Crée des overlays professionnels et donne une identité visuelle à tes streams.",
    icon: Radio,
    plans: [
      {
        name: "Starter",
        price: 0,
        description: "Pour découvrir les outils de diffusion HubGamers.",
        cta: "Créer mon studio",
        features: [
          "1 studio",
          "2 overlays standards",
          "Association à un tournoi",
          "Couleurs prédéfinies",
          "Branding HubGamers",
        ],
      },
      {
        name: "Plus",
        price: 9,
        description: "Pour personnaliser tes premières productions.",
        cta: "Choisir Studio Plus",
        highlighted: true,
        badge: "Populaire",
        features: [
          "Tout ce qui est inclus dans Starter",
          "Jusqu'à 5 overlays",
          "Personnalisation des overlays",
          "Affichage des sponsors et casters",
          "Branding HubGamers réduit",
        ],
      },
      {
        name: "Pro",
        price: 19,
        description: "Pour les studios et productions professionnelles.",
        cta: "Choisir Studio Pro",
        features: [
          "Tout ce qui est inclus dans Plus",
          "Jusqu'à 15 overlays",
          "Personnalisation avancée",
          "Suppression du branding HubGamers",
        ],
      },
      {
        name: "Enterprise",
        price: null,
        description: "Pour les productions ayant besoin d'outils sur mesure.",
        cta: "Contacter notre équipe",
        enterprise: true,
        features: [
          "Overlays sur mesure",
          "Design personnalisé",
          "Intégrations spécifiques",
          "Accompagnement dédié",
        ],
      },
    ],
  },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(price);

type SubscriptionSummary = {
  id: string;
  customerId: string | null;
  name: string;
  planId: string;
  status: string;
  isCurrent: boolean;
  currency: string;
  amount: number | null;
  interval: string | null;
  intervalCount: number;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
};

type InvoiceSummary = {
  id: string;
  number: string | null;
  created: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  status: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
};

type BillingData = {
  customers: { customerId: string }[];
  subscriptions: SubscriptionSummary[];
  invoices: InvoiceSummary[];
};

const subscriptionStatusLabels: Record<string, string> = {
  checkout_pending: "Paiement en attente",
  checkout_expired: "Session de paiement expirée",
  checkout_failed: "Échec de la création du paiement",
  active: "Actif",
  trialing: "Essai en cours",
  past_due: "Paiement à régulariser",
  canceled: "Résilié",
  unpaid: "Impayé",
  incomplete: "Paiement à confirmer",
  incomplete_expired: "Paiement expiré",
  paused: "Suspendu",
};

const invoiceStatusLabels: Record<string, string> = {
  draft: "Brouillon",
  open: "À payer",
  paid: "Payée",
  uncollectible: "Impayable",
  void: "Annulée",
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatBillingInterval(interval: string | null, count: number) {
  if (!interval) return "Récurrent";
  const units: Record<string, string> = {
    day: count > 1 ? "jours" : "jour",
    week: count > 1 ? "semaines" : "semaine",
    month: count > 1 ? "mois" : "mois",
    year: count > 1 ? "ans" : "an",
  };
  const unit = units[interval];

  return unit ? `/${count > 1 ? `${count} ` : ""}${unit}` : "Récurrent";
}

function BillingOverview({
  onSubscriptionsChange,
}: {
  onSubscriptionsChange: (subscriptions: SubscriptionSummary[]) => void;
}) {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [portalLoading, setPortalLoading] = useState("");

  const loadBilling = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/billing", { cache: "no-store" });
      const data: unknown = await response.json();
      const message =
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof data.error === "string"
          ? data.error
          : null;

      if (!response.ok) {
        throw new Error(message || "Impossible de charger la facturation.");
      }

      const billingData = data as BillingData;
      setBilling(billingData);
      onSubscriptionsChange(billingData.subscriptions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger la facturation."
      );
    } finally {
      setLoading(false);
    }
  }, [onSubscriptionsChange]);

  useEffect(() => {
    void loadBilling();
  }, [loadBilling]);

  const openBillingPortal = async (customerId: string) => {
    setPortalLoading(customerId);
    setError("");

    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data: unknown = await response.json();
      const message =
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof data.error === "string"
          ? data.error
          : null;
      const url =
        data && typeof data === "object" && "url" in data
          ? data.url
          : undefined;

      if (!response.ok) {
        throw new Error(message || "Impossible d'ouvrir le portail Stripe.");
      }
      if (typeof url !== "string") {
        throw new Error("URL du portail Stripe introuvable.");
      }

      window.location.assign(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'ouvrir le portail Stripe."
      );
      setPortalLoading("");
    }
  };

  const customers = billing?.customers ?? [];
  const subscriptions = billing?.subscriptions ?? [];
  const invoices = billing?.invoices ?? [];

  return (
    <section className="mb-14 rounded-3xl border border-white/[0.08] bg-[#101521]/90 p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ccff00]">
            <CreditCard size={15} />
            Espace de facturation
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Mes abonnements et factures
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Données synchronisées avec Stripe.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadBilling()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p>{error}</p>
            {error.includes("Connecte-toi") && (
              <Link href="/login" className="mt-2 inline-block underline">
                Se connecter
              </Link>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-12 text-sm text-slate-400">
          <Loader2 size={18} className="animate-spin text-[#ccff00]" />
          Synchronisation de tes données Stripe...
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-2">
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-bold">
              <CircleCheck size={18} className="text-[#ccff00]" />
              Abonnements
            </h2>
            {subscriptions.length ? (
              <div className="space-y-3">
                {subscriptions.map((subscription) => (
                  <article
                    key={subscription.id}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold">{subscription.name}</h3>
                        <span className="mt-2 inline-flex rounded-full border border-[#ccff00]/20 bg-[#ccff00]/[0.08] px-2.5 py-1 text-xs font-semibold text-[#ccff00]">
                          {subscriptionStatusLabels[subscription.status] ??
                            subscription.status}
                        </span>
                      </div>
                      {subscription.amount !== null && (
                        <p className="text-lg font-black">
                          {formatCurrency(
                            subscription.amount,
                            subscription.currency
                          )}
                          <span className="ml-1 text-xs font-normal text-slate-500">
                            {formatBillingInterval(
                              subscription.interval,
                              subscription.intervalCount
                            )}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                      <p className="flex items-center gap-2 text-xs text-slate-400">
                        <CalendarDays size={14} />
                        {subscription.cancelAtPeriodEnd
                          ? "Fin prévue le"
                          : "Prochaine échéance"}
                        {subscription.currentPeriodEnd
                          ? ` ${new Date(
                              subscription.currentPeriodEnd * 1000
                            ).toLocaleDateString("fr-FR")}`
                          : " non communiquée"}
                      </p>
                      {subscription.customerId && (
                        <button
                          type="button"
                          onClick={() =>
                            void openBillingPortal(subscription.customerId!)
                          }
                          disabled={
                            portalLoading === subscription.customerId
                          }
                          className="inline-flex items-center gap-2 text-xs font-semibold text-[#ccff00] hover:underline disabled:opacity-50"
                        >
                          {portalLoading === subscription.customerId ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <ExternalLink size={14} />
                          )}
                          Gérer l'abonnement
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-sm text-slate-400">
                Aucun abonnement payant trouvé pour ton compte.
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 flex items-center gap-2 font-bold">
              <FileText size={18} className="text-[#ccff00]" />
              Factures
            </h2>
            {invoices.length ? (
              <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
                {invoices.map((invoice) => (
                  <article
                    key={invoice.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        Facture {invoice.number ?? invoice.id}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(invoice.created * 1000).toLocaleDateString(
                          "fr-FR"
                        )}
                        {invoice.status && (
                          <>
                            {" · "}
                            {invoiceStatusLabels[invoice.status] ??
                              invoice.status}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">
                        {formatCurrency(
                          invoice.status === "paid"
                            ? invoice.amountPaid
                            : invoice.amountDue,
                          invoice.currency
                        )}
                      </span>
                      {(invoice.hostedInvoiceUrl || invoice.invoicePdf) && (
                        <a
                          href={
                            invoice.hostedInvoiceUrl ?? invoice.invoicePdf!
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Ouvrir la facture ${
                            invoice.number ?? invoice.id
                          }`}
                          className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:border-[#ccff00]/40 hover:text-[#ccff00]"
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-sm text-slate-400">
                Aucune facture disponible.
              </div>
            )}
          </div>

          {!subscriptions.length && customers.length > 0 && (
            <div className="xl:col-span-2">
              {customers.map(({ customerId }) => (
                <button
                  key={customerId}
                  type="button"
                  onClick={() => void openBillingPortal(customerId)}
                  disabled={portalLoading === customerId}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] disabled:opacity-50"
                >
                  {portalLoading === customerId ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <ExternalLink size={15} />
                  )}
                  Gérer ma facturation
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function PricingPage() {
  const [activeCategory, setActiveCategory] =
    useState<Category>("organizer");
  const [accountSubscriptions, setAccountSubscriptions] = useState<
    SubscriptionSummary[] | null
  >(null);

  const currentCategory = pricingCategories.find(
    (category) => category.id === activeCategory
  )!;
  const currentPlanIds = new Set(
    (accountSubscriptions ?? [])
      .filter(
        (subscription) =>
          subscription.isCurrent &&
          subscription.planId.startsWith(`${activeCategory}-`)
      )
      .map((subscription) => subscription.planId)
  );
  const currentPlanIndex = Math.max(
    -1,
    ...currentCategory.plans.map((plan, index) =>
      currentPlanIds.has(`${activeCategory}-${plan.name.toLowerCase()}`)
        ? index
        : -1
    )
  );
  const hasCurrentPlan = currentPlanIndex >= 0;

  return (
    <main className="min-h-screen bg-[#080b12] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute bottom-0 right-[-200px] h-[500px] w-[500px] rounded-full bg-[#ccff00]/[0.04] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12">
        <BillingOverview onSubscriptionsChange={setAccountSubscriptions} />

        {/* Header */}
        <header className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ccff00]/20 bg-[#ccff00]/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#ccff00]">
            <Sparkles size={14} />
            HubGamers Pricing
          </div>

          <h2 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Le bon plan pour
            <span className="block text-[#ccff00]">
              chaque ambition.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Que tu sois joueur, organisateur, club ou créateur de contenu,
            découvre les outils dont tu as besoin pour évoluer dans
            l'écosystème HubGamers.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Check size={16} className="text-[#ccff00]" />
              Une offre gratuite disponible
            </span>
            <span className="flex items-center gap-2">
              <Check size={16} className="text-[#ccff00]" />
              Sans engagement
            </span>
            <span className="flex items-center gap-2">
              <Check size={16} className="text-[#ccff00]" />
              Évolue à ton rythme
            </span>
          </div>
        </header>

        {/* Category selector */}
        <div className="mx-auto mb-12 flex max-w-4xl flex-wrap justify-center gap-2 rounded-2xl border border-white/[0.06] bg-[#101521]/80 p-2">
          {pricingCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex flex-1 min-w-[130px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#ccff00] text-[#10140a] shadow-[0_0_25px_rgba(204,255,0,0.12)]"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon size={17} />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Category description */}
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold">
            Offres {currentCategory.label}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {currentCategory.description}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Tous les tarifs sont indiqués en euros par mois.
          </p>
        </div>

        {/* Pricing cards */}
        <div
          className={`mx-auto grid max-w-7xl items-stretch gap-5 ${
            currentCategory.plans.length === 3
              ? "lg:grid-cols-3"
              : "lg:grid-cols-4"
          }`}
        >
          {currentCategory.plans.map((plan, index) => {
            const isCurrentPlan = currentPlanIds.has(
              `${activeCategory}-${plan.name.toLowerCase()}`
            );
            const isIncludedPlan = hasCurrentPlan && index < currentPlanIndex;
            const isRecommendedPlan = hasCurrentPlan
              ? index === currentPlanIndex + 1
              : Boolean(plan.highlighted);

            return (
              <article
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                  isRecommendedPlan
                    ? "border-[#ccff00]/60 bg-[#141c1d] shadow-[0_0_45px_rgba(204,255,0,0.07)]"
                    : "border-white/[0.08] bg-[#101521]/90 hover:border-white/20"
                }`}
              >
                {isCurrentPlan ? (
                  <div className="absolute -top-3 left-6 rounded-full border border-white/20 bg-[#101521] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Abonnement actuel
                  </div>
                ) : (
                  plan.badge && (
                    <div className="absolute -top-3 left-6 rounded-full bg-[#ccff00] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#10140a]">
                      {plan.badge}
                    </div>
                  )
                )}

                {plan.enterprise && (
                  <div className="absolute -top-3 left-6 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                    Sur mesure
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6 border-b border-white/[0.08] pb-6">
                  {plan.enterprise ? (
                    <>
                      <p className="text-2xl font-black">Sur devis</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Tarif personnalisé
                      </p>
                    </>
                  ) : plan.price === 0 ? (
                    <>
                      <p className="text-4xl font-black">Gratuit</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Pour toujours
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-black tracking-tight">
                          {formatPrice(plan.price!)}
                        </span>
                        <span className="mb-1 text-sm text-slate-500">
                          / mois
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Facturation mensuelle
                      </p>
                    </>
                  )}
                </div>

                {isCurrentPlan ? (
                  <button
                    type="button"
                    disabled
                    className="mb-7 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm font-bold text-slate-500"
                  >
                    Abonnement actuel
                  </button>
                ) : isIncludedPlan ? (
                  <button
                    type="button"
                    disabled
                    className="mb-7 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm font-bold text-slate-500"
                  >
                    Inclus dans ton offre
                  </button>
                ) : (
                  <Link
                    href={
                      plan.enterprise
                        ? `/contact?plan=${activeCategory}-enterprise`
                        : plan.price === 0
                          ? "/register"
                          : `/checkout?plan=${activeCategory}-${plan.name.toLowerCase()}${hasCurrentPlan ? "&change=1" : ""}`
                    }
                    className={`mb-7 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                      isRecommendedPlan
                        ? "bg-[#ccff00] text-[#10140a] hover:bg-[#dcff55]"
                        : plan.enterprise
                          ? "border border-indigo-400/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                          : "border border-white/10 bg-white/[0.05] text-white hover:bg-white/10"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight size={16} />
                  </Link>
                )}

                <div className="flex-1">
                  <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    Fonctionnalités incluses
                  </p>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2.5 text-sm leading-5 text-slate-300"
                      >
                        <Check
                          size={16}
                          className={`mt-0.5 shrink-0 ${
                            isRecommendedPlan
                              ? "text-[#ccff00]"
                              : "text-emerald-400"
                          }`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {/* Trust section */}
        <section className="mt-20 grid gap-6 rounded-3xl border border-white/[0.07] bg-[#101521]/80 p-8 md:grid-cols-3 lg:p-10">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ccff00]/10 text-[#ccff00]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold">Sans engagement</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Modifie ou annule ton abonnement selon tes besoins.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <Zap size={22} />
            </div>
            <div>
              <h3 className="font-bold">Évolutif</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Passe à une formule supérieure quand ton activité grandit.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <Headset size={22} />
            </div>
            <div>
              <h3 className="font-bold">Accompagnement</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Une équipe disponible pour accompagner tes projets.
              </p>
            </div>
          </div>
        </section>

        {/* Enterprise CTA */}
        <section className="mt-10 overflow-hidden rounded-3xl border border-[#ccff00]/20 bg-gradient-to-br from-[#17201a] to-[#101521] p-8 text-center sm:p-12">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ccff00]/10 text-[#ccff00]">
            <Crown size={27} />
          </div>

          <h2 className="text-2xl font-black sm:text-3xl">
            Un projet à grande échelle ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Besoin d'un environnement personnalisé, d'une identité graphique
            complète ou d'une infrastructure adaptée à tes événements ?
            Construisons ensemble ton offre Enterprise.
          </p>

          <Link
            href="/contact?plan=enterprise"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#ccff00] px-6 py-3 font-bold text-[#10140a] transition hover:bg-[#dcff55]"
          >
            Discuter de mon projet
            <ArrowRight size={17} />
          </Link>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-600">
          Les fonctionnalités et quotas sont soumis aux conditions de chaque
          formule. Les offres gratuites sont accessibles sans abonnement.
        </footer>
      </div>
    </main>
  );
}
