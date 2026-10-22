"use client"

import Link from "next/link"
import { Gamepad2, ShieldCheck, Trophy, Tv } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import { toast } from "sonner"

function LoginContent() {
  const searchParams = useSearchParams()
  const authRequired = searchParams.get("authRequired")

  useEffect(() => {
    if (authRequired) {
      toast.error("Accès restreint", {
        id: "auth-required-toast",
        description: "Vous devez être connecté pour accéder à cette page.",
        duration: 5000,
      })
    }
  }, [authRequired])

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      {/* Form Side */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-blue-600 text-slate-950 font-black shadow-[0_0_15px_rgba(0,242,254,0.35)] transition-transform group-hover:scale-105">
              <Gamepad2 className="size-5 text-brand-ink" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              HUB<span className="text-brand-cyan">GAMERS</span>
            </span>
          </Link>
          <Link
            href="/register"
            className="text-xs font-semibold text-muted-foreground hover:text-brand-cyan transition-colors"
          >
            Pas de compte ? <span className="text-white underline underline-offset-4">S'inscrire</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>

        <div className="text-center sm:text-left text-xs text-muted-foreground">
          © {new Date().getFullYear()} HubGamers. Plateforme SaaS esport sécurisée.
        </div>
      </div>

      {/* Esports Showcase Visual Side */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-l border-white/[0.08] bg-[#090d16]">
        {/* Glow Halos */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-brand-cyan/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-violet/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 esport-grid-bg opacity-30 pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3.5 py-1 text-xs font-semibold text-brand-cyan backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-brand-cyan animate-pulse" />
            ESPACE OFFICIEL DE COMPÉTITION
          </div>
        </div>

        {/* Center Mockup Card */}
        <div className="relative z-10 max-w-md mx-auto w-full my-auto">
          <div className="rounded-2xl border border-white/[0.12] bg-card/85 p-6 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-brand-cyan" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Tournoi Apex Series · Finale
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                EN DIRECT
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-2">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400">
                  KC
                </div>
                <div>
                  <p className="font-bold text-white">Karmine Corp</p>
                  <p className="text-[11px] text-muted-foreground">5 Joueurs prêts</p>
                </div>
              </div>
              <div className="text-center font-mono font-black text-lg text-white px-3 py-1 rounded bg-black/40 border border-white/10">
                2 - 1
              </div>
              <div className="flex items-center gap-2.5 flex-row-reverse text-right">
                <div className="size-9 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400">
                  M8
                </div>
                <div>
                  <p className="font-bold text-white">Gentle Mates</p>
                  <p className="text-[11px] text-muted-foreground">5 Joueurs prêts</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-black/40 p-3 border border-white/[0.06] flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Tv className="size-3.5 text-brand-cyan" />
                Overlay OBS synchronisé
              </span>
              <span className="text-emerald-400 font-mono">0ms de délai</span>
            </div>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="relative z-10 grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="size-4 text-brand-cyan" />
            <span>Feuilles de match certifiées</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Tv className="size-4 text-purple-400" />
            <span>Overlays broadcast OBS prêts à l'emploi</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginContent />
    </Suspense>
  )
}
