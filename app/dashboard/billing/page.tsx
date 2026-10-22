import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import { CreditCard, Check, Zap, Sparkles, Shield, Trophy, ArrowRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Facturation & Abonnements · HubGamers",
  description: "Gérez votre forfait HubGamers, vos limites d'organisation et vos factures.",
}

const PLANS = [
  {
    id: "starter",
    name: "Starter Gamer",
    price: "0 €",
    period: "gratuit à vie",
    description: "Idéal pour participer à des tournois et rejoindre des équipes compétitives.",
    features: [
      "Profil compétitif joueur certifié",
      "Rejoindre un nombre illimité de rosters",
      "Accès aux tournois ouverts HubGamers",
      "Match chats & déclaration des scores",
      "Passeport esport du joueur",
    ],
    isCurrent: true,
    cta: "Votre forfait actuel",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro Competitor",
    price: "9.99 €",
    period: "/mois sans engagement",
    description: "Pour les joueurs exigeants et capitaines cherchant l'analyse et la visibilité.",
    features: [
      "Tout le forfait Starter Gamer",
      "Badge Pro certifié sur votre profil",
      "Statistiques avancées de victoires et KDA",
      "Création de jusqu'à 5 Lineups officielles",
      "Alertes SMS & Discord des horaires de match",
      "Accès prioritaire aux tournois à cashprize",
    ],
    isCurrent: false,
    cta: "Passer à la formule Pro",
    popular: true,
  },
  {
    id: "director",
    name: "Tournament Director & Club",
    price: "29.99 €",
    period: "/mois sans engagement",
    description: "La solution complète pour organisateurs d'événements, web TV et clubs esports.",
    features: [
      "Tout le forfait Pro Competitor",
      "Organisation de tournois illimitée",
      "Studio OBS Broadcast & Overlays temps réel",
      "Arbres d'élimination jusqu'à 128 équipes",
      "Gestion multi-arbitres et arbitrage de litiges",
      "Intégration des sponsors et casters officiels",
    ],
    isCurrent: false,
    cta: "Débloquer le Studio Pro",
    popular: false,
  },
]

export default async function BillingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="size-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              ABONNEMENT & QUOTAS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Plans & Facturation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Faites évoluer votre structure vers les fonctionnalités professionnelles de diffusion et d'arbitrage.
          </p>
        </div>

        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 text-xs">
          Compte actif · Aucune facture en retard
        </Badge>
      </div>

      {/* Grille des tarifs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col justify-between border-white/10 bg-card/60 backdrop-blur-sm transition-all duration-300 ${
              plan.popular ? "border-cyan-400/50 shadow-xl shadow-cyan-500/10" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                Le plus plébiscité
              </div>
            )}

            <div>
              <CardHeader className="p-6">
                <CardTitle className="text-lg font-bold text-white">{plan.name}</CardTitle>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="text-xs mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 pt-2 border-t border-white/5">
                  Fonctionnalités incluses :
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="size-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </div>

            <CardFooter className="p-6 border-t border-white/5">
              {plan.isCurrent ? (
                <Button disabled className="w-full bg-white/10 text-white font-semibold text-xs">
                  {plan.cta}
                </Button>
              ) : (
                <Button
                  className={`w-full text-xs font-bold ${
                    plan.popular
                      ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:opacity-90"
                      : "bg-purple-600 hover:bg-purple-500 text-white"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="size-3.5 ml-1" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Historique des reçus */}
      <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="size-4 text-purple-400" />
            Historique des transactions & factures
          </CardTitle>
          <CardDescription className="text-xs">
            Téléchargez les justificatifs comptables de votre compte HubGamers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-white/5 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Abonnement Starter - Période active</span>
                <span className="text-muted-foreground">{new Date().toLocaleDateString("fr-FR")} · Carte par défaut</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-emerald-400">0.00 €</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-white">
                  <Download className="size-3 mr-1" />
                  Reçu
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
