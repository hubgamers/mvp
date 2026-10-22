import { CreditCard, Check, Sparkles, Zap, Shield, Trophy } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const plans = [
  {
    name: "Starter Arène",
    price: "0 €",
    frequency: "/ toujours gratuit",
    badge: "ACTUEL",
    badgeVariant: "outline" as const,
    description: "Idéal pour lancer vos premiers tournois communautaires et composer vos rosters.",
    features: [
      "Arbres jusqu'à 16 équipes",
      "Génération automatique single elimination",
      "1 projet Studio OBS broadcast (720p)",
      "Feuilles de match & chat arbitré",
      "Support communautaire Discord",
    ],
    cta: "Plan actuel",
    disabled: true,
    highlight: false,
  },
  {
    name: "Club & Organisateur PRO",
    price: "29 €",
    frequency: "/ mois",
    badge: "POPULAIRE",
    badgeVariant: "cyber" as const,
    description: "Pour les structures esport, streamers et organisateurs réguliers.",
    features: [
      "Tournois illimités jusqu'à 128 équipes",
      "Arbres double élimination & phases de poules",
      "Studio OBS illimité en 1080p60 temps réel",
      "Gestion multi-arbitres & logs de contestation",
      "Feuilles de match certifiées et export CSV",
      "Branding personnalisé de vos overlays",
    ],
    cta: "Passer à HubGamers PRO",
    disabled: false,
    highlight: true,
  },
  {
    name: "Enterprise & Ligues",
    price: "Sur mesure",
    frequency: "/ saison",
    badge: "ÉLITE",
    badgeVariant: "violet" as const,
    description: "Pour les ligues officielles, associations majeures et éditeurs de jeux.",
    features: [
      "Formats personnalisés & seedings avancés",
      "Intégration API temps réel & Webhooks",
      "Régie broadcast multi-flux avec régie caster",
      "Support dédié 7j/7 avec SLA 99.9%",
      "Contrats joueurs et gestion des transferts",
    ],
    cta: "Contacter l'équipe ligue",
    disabled: false,
    highlight: false,
  },
]

export default function BillingPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="size-5 text-brand-cyan" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-cyan">
              FORMULES & ABONNEMENTS
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            Facturation & Forfaits
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choisissez l'offre adaptée à l'envergure de vos compétitions et diffusez sans limites.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 font-semibold">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ACCÈS BÊTA ILLIMITÉ ACTIF
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-col justify-between transition-all duration-300 ${
              plan.highlight
                ? "border-brand-cyan/50 bg-gradient-to-b from-brand-cyan/[0.07] via-card to-card shadow-[0_0_35px_rgba(0,242,254,0.15)] relative"
                : "border-white/[0.08] bg-card/75"
            }`}
          >
            {plan.highlight && (
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-cyan to-blue-500 text-black font-black text-[10px] tracking-widest uppercase px-3 py-0.5 rounded-full shadow-[0_0_15px_rgba(0,242,254,0.5)]">
                RECOMMANDÉ POUR ORGANISATEURS
              </div>
            )}

            <CardHeader className="pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black text-white uppercase">{plan.name}</CardTitle>
                <Badge variant={plan.badgeVariant} className="text-[10px]">
                  {plan.badge}
                </Badge>
              </div>
              <CardDescription className="text-xs mt-2">{plan.description}</CardDescription>
              <div className="pt-4 flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white">{plan.price}</span>
                <span className="text-xs text-muted-foreground font-medium">{plan.frequency}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 py-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Inclus :</p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <Check className="size-4 text-brand-cyan shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="pt-4">
              <Button
                variant={plan.highlight ? "default" : "outline"}
                className={`w-full text-xs font-bold uppercase tracking-wider ${
                  plan.highlight ? "shadow-[0_0_20px_rgba(0,242,254,0.4)]" : ""
                }`}
                disabled={plan.disabled}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
