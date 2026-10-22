import Link from "next/link";
import {
  Trophy,
  Gamepad2,
  Tv,
  Users,
  ShieldCheck,
  ArrowRight,
  Flame,
  Swords,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-brand-cyan selection:text-brand-ink">
      {/* Background Cyber Accents */}
      <div className="fixed inset-0 pointer-events-none esport-grid-bg opacity-30 z-0" />
      <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[600px] h-[400px] bg-brand-cyan/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-1/3 right-10 w-[500px] h-[500px] bg-brand-violet/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-blue-600 text-slate-950 font-black shadow-[0_0_20px_rgba(0,242,254,0.35)] transition-transform group-hover:scale-105">
              <Gamepad2 className="size-6 text-brand-ink" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white flex items-center">
                HUB<span className="text-brand-cyan">GAMERS</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground -mt-1">
                Esport SaaS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-brand-cyan transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#tournaments" className="hover:text-brand-cyan transition-colors">
              Compétitions
            </Link>
            <Link href="#studio" className="hover:text-brand-cyan transition-colors">
              Studio Broadcast
            </Link>
            <Link href="/dashboard/tournaments/explore" className="hover:text-brand-cyan transition-colors">
              Explorer
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/register">
                Rejoindre l'arène
                <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1">
        <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Top pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-1.5 text-xs font-semibold text-brand-cyan mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(0,242,254,0.15)]">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75 pulse-dot" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-cyan" />
              </span>
              <span className="tracking-wide">HUBGAMERS ENGINE 2.0 • L'OS DES ORGANISATEURS ESPORT</span>
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.08]">
              Pilotez vos compétitions{" "}
              <span className="bg-gradient-to-r from-brand-cyan via-blue-400 to-brand-violet bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,242,254,0.3)]">
                comme les pros
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Arbres de tournois automatisés, studio d'overlays OBS synchronisé en temps réel,
              gestion des rosters d'équipes et arbitrage certifié. Tout votre écosystème réuni sur un SaaS dédié.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base shadow-[0_0_30px_rgba(0,242,254,0.4)]" asChild>
                <Link href="/register">
                  <Flame className="size-5 mr-2" />
                  Lancer un tournoi gratuitement
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 text-base" asChild>
                <Link href="/dashboard">
                  Accéder au Dashboard
                  <ChevronRight className="size-4 ml-1" />
                </Link>
              </Button>
            </div>

            {/* Trust Metrics */}
            <div className="mt-16 pt-8 border-t border-white/[0.08] grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-white tracking-tight flex items-center gap-1">
                  500<span className="text-brand-cyan">+</span>
                </span>
                <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground mt-1">
                  Tournois organisés
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-white tracking-tight flex items-center gap-1">
                  12k<span className="text-brand-violet">+</span>
                </span>
                <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground mt-1">
                  Joueurs inscrits
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-white tracking-tight flex items-center gap-1">
                  &lt; 50<span className="text-emerald-400">ms</span>
                </span>
                <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground mt-1">
                  Latence Overlays OBS
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-white tracking-tight flex items-center gap-1">
                  99.9<span className="text-brand-cyan">%</span>
                </span>
                <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground mt-1">
                  Stabilité des matchs
                </span>
              </div>
            </div>

            {/* Interactive Visual Cockpit Mockup */}
            <div className="mt-14 relative mx-auto max-w-5xl rounded-2xl border border-white/[0.12] bg-card/90 p-3 sm:p-5 shadow-[0_20px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
              {/* Window controls bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] px-2">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="size-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="size-3 rounded-full bg-green-500/80 inline-block" />
                  <span className="ml-3 text-xs font-mono text-muted-foreground">
                    hubgamers.pro/dashboard/tournaments/apex-masters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-400 border border-red-500/30">
                    <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                    LIVE MATCH #4
                  </span>
                </div>
              </div>

              {/* Cockpit contents */}
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {/* Match Face-off banner */}
                <div className="lg:col-span-2 rounded-xl border border-white/[0.08] bg-black/40 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span className="font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                      <Swords className="size-4 text-brand-cyan" />
                      Grande Finale · Best of 5
                    </span>
                    <Badge variant="cyber">Game 4 · Map: Ascent</Badge>
                  </div>

                  <div className="grid grid-cols-7 items-center py-4">
                    {/* Team Alpha */}
                    <div className="col-span-3 flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
                      <div className="size-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center font-black text-xl text-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.2)]">
                        KC
                      </div>
                      <div>
                        <p className="font-black text-white text-base">Karmine Corp</p>
                        <p className="text-xs text-muted-foreground">Seed #1 · 4-0</p>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="col-span-1 flex flex-col items-center">
                      <div className="flex items-center gap-2 text-2xl sm:text-3xl font-black text-white">
                        <span className="text-cyan-400">2</span>
                        <span className="text-muted-foreground text-lg">-</span>
                        <span className="text-purple-400">1</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 mt-1">
                        11 - 9 Round
                      </span>
                    </div>

                    {/* Team Beta */}
                    <div className="col-span-3 flex flex-col items-center sm:items-end text-center sm:text-right gap-2">
                      <div className="size-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/30 border border-purple-500/40 flex items-center justify-center font-black text-xl text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        M8
                      </div>
                      <div>
                        <p className="font-black text-white text-base">Gentle Mates</p>
                        <p className="text-xs text-muted-foreground">Seed #2 · 3-1</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Tv className="size-3.5 text-brand-cyan" />
                      Overlay OBS Actif · 1080p60
                    </span>
                    <span className="text-brand-cyan font-semibold">Feuille de match vérifiée ✓</span>
                  </div>
                </div>

                {/* Broadcast / OBS quick controls */}
                <div className="rounded-xl border border-white/[0.08] bg-black/40 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <Tv className="size-4 text-purple-400" />
                        Studio Broadcast
                      </span>
                      <span className="text-[10px] rounded bg-purple-500/20 text-purple-300 px-1.5 py-0.5 font-mono">
                        STREAM ID: 9482
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Scène active : <strong className="text-white">In-Game Scoreboard & Rosters</strong>
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-lg bg-white/[0.04] p-2 text-xs">
                        <span className="text-slate-300">Mise à jour des scores</span>
                        <span className="text-emerald-400 font-mono font-semibold">AUTO-SYNC</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-white/[0.04] p-2 text-xs">
                        <span className="text-slate-300">Rosters & Caméras</span>
                        <span className="text-brand-cyan font-mono font-semibold">10/10 JOUEURS</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-white/[0.04] p-2 text-xs">
                        <span className="text-slate-300">URL Navigateur OBS</span>
                        <span className="text-slate-400 font-mono text-[10px] truncate max-w-[120px]">
                          hubgamers.pro/studio/c7a
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button size="sm" variant="outline" className="w-full text-xs" asChild>
                      <Link href="/dashboard/studio">
                        Ouvrir le Studio Broadcast
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-24 border-t border-white/[0.08] bg-black/30 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="cyber" className="mb-4">
                FONCTIONNALITÉS CLÉS
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
                Conçu pour les organisateurs les plus exigeants
              </h2>
              <p className="mt-4 text-slate-400 text-base">
                Fini les tableurs et les erreurs manuelles. HubGamers automatise l'ensemble de la chaîne de valeur de votre événement esport.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-white/[0.08] bg-card/60 p-6 backdrop-blur-md hover:border-brand-cyan/40 transition-all duration-300 group">
                <div className="size-12 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan mb-5 group-hover:scale-110 transition-transform">
                  <Trophy className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Arbres de Tournois Intelligents</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Génération en un clic : simple élimination, double bracket, poules. Avancement automatique des gagnants après confirmation du match.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-white/[0.08] bg-card/60 p-6 backdrop-blur-md hover:border-brand-violet/40 transition-all duration-300 group">
                <div className="size-12 rounded-xl bg-brand-violet/10 border border-brand-violet/30 flex items-center justify-center text-brand-violet mb-5 group-hover:scale-110 transition-transform">
                  <Tv className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Studio OBS Temps Réel</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Lien source navigateur pour OBS / vMix. Les overlays graphiques affichent en live les scores, pseudos, logos et cartes jouées sans régie manuelle.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-white/[0.08] bg-card/60 p-6 backdrop-blur-md hover:border-emerald-500/40 transition-all duration-300 group">
                <div className="size-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                  <Users className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Structures & Rosters</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Gestion centralisée des organisations esport : capitaines, titulaires, remplaçants, managers, invitations sécurisées et historique complet.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl border border-white/[0.08] bg-card/60 p-6 backdrop-blur-md hover:border-amber-500/40 transition-all duration-300 group">
                <div className="size-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Arbitrage & Feuilles de Match</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Chat privé par match, soumission des résultats avec preuve screenshot, validation par l'adversaire ou intervention immédiate des arbitres.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Games Ticker */}
        <section className="py-14 border-t border-white/[0.06] overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">
              Compatible avec vos jeux compétitifs préférés
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-400 font-bold text-sm tracking-wider uppercase">
              <span className="flex items-center gap-2 hover:text-white transition-colors">
                <span className="size-2 rounded-full bg-red-500" /> Valorant
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors">
                <span className="size-2 rounded-full bg-blue-500" /> League of Legends
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors">
                <span className="size-2 rounded-full bg-amber-500" /> Counter-Strike 2
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors">
                <span className="size-2 rounded-full bg-cyan-400" /> Rocket League
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors">
                <span className="size-2 rounded-full bg-emerald-400" /> EA FC 25
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors">
                <span className="size-2 rounded-full bg-purple-400" /> Apex Legends
              </span>
            </div>
          </div>
        </section>

        {/* Big CTA */}
        <section className="py-20 border-t border-white/[0.08] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/10 via-transparent to-brand-violet/10 pointer-events-none" />
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              Prêt à révolutionner votre prochain tournoi ?
            </h2>
            <p className="mt-4 text-slate-300 text-base max-w-xl mx-auto">
              Rejoignez les organisateurs qui font confiance à HubGamers pour offrir une expérience esport professionnelle à leurs joueurs et spectateurs.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base shadow-[0_0_25px_rgba(0,242,254,0.4)]" asChild>
                <Link href="/register">
                  Créer mon compte organisateur
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 text-base" asChild>
                <Link href="/login">Déjà inscrit ? Se connecter</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-black/60 py-12 relative z-10 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-brand-cyan text-brand-ink font-black">
              <Gamepad2 className="size-4" />
            </div>
            <span className="font-bold text-white text-sm">
              Hub<span className="text-brand-cyan">Gamers</span>
            </span>
            <span>· Plateforme Esport SaaS © {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard/tournaments/explore" className="hover:text-white transition-colors">
              Tournois
            </Link>
            <Link href="/dashboard/structures/explore" className="hover:text-white transition-colors">
              Structures
            </Link>
            <Link href="/dashboard/studio" className="hover:text-white transition-colors">
              Studio
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
