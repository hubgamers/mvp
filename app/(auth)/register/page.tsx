import Link from "next/link"
import { Gamepad2, ShieldCheck, Trophy, Tv, Users } from "lucide-react"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
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
            href="/login"
            className="text-xs font-semibold text-muted-foreground hover:text-brand-cyan transition-colors"
          >
            Déjà inscrit ? <span className="text-white underline underline-offset-4">Se connecter</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <RegisterForm />
          </div>
        </div>

        <div className="text-center sm:text-left text-xs text-muted-foreground">
          En vous inscrivant, vous acceptez les conditions d'utilisation de HubGamers.
        </div>
      </div>

      {/* Esports Showcase Visual Side */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-l border-white/[0.08] bg-[#090d16]">
        {/* Glow Halos */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-brand-cyan/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-violet/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 esport-grid-bg opacity-30 pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-violet/30 bg-brand-violet/10 px-3.5 py-1 text-xs font-semibold text-brand-violet backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-brand-violet animate-pulse" />
            INSCRIPTION ORGANISATEUR & ROSTER
          </div>
        </div>

        {/* Center Benefits Card */}
        <div className="relative z-10 max-w-md mx-auto w-full my-auto space-y-4">
          <div className="rounded-2xl border border-white/[0.12] bg-card/85 p-6 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-4">
            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Trophy className="size-5 text-brand-cyan" />
              Rejoignez l'élite compétitive
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Créez votre compte en quelques secondes et accédez à tous les outils nécessaires pour structurer votre club et vos tournois.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 rounded-lg bg-black/40 p-3 border border-white/[0.06]">
                <Users className="size-4 text-brand-cyan mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Gestion de Structures & Équipes</h4>
                  <p className="text-[11px] text-muted-foreground">Invitez vos joueurs, capitaines et arbitres en direct.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-black/40 p-3 border border-white/[0.06]">
                <Tv className="size-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Studio de Diffusion Stream</h4>
                  <p className="text-[11px] text-muted-foreground">Overlays graphiques générés pour OBS sans graphiste.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground">
          <span>Plateforme utilisée par plus de 500 organisateurs</span>
          <span className="text-brand-cyan font-mono font-semibold">100% Gratuit au lancement</span>
        </div>
      </div>
    </div>
  )
}
