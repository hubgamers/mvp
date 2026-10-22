'use client'

import { useActionState } from "react"
import { login } from "@/app/actions/auth.actions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LogIn } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <form action={formAction} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1.5 text-center mb-2">
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            Connexion au QG
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs">
            Accédez à vos tournois, gérez vos équipes et lancez vos overlays broadcast.
          </p>
        </div>

        {state?.error && (
          <div className="p-3 text-xs font-medium text-red-400 bg-red-500/10 rounded-lg border border-red-500/20 text-center animate-in fade-in-50">
            {state.error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email" className="text-xs font-semibold text-slate-300">
            Adresse email
          </FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="capitaine@structure.esport"
            required
            className="h-10 bg-black/40 border-white/10 focus-visible:border-brand-cyan focus-visible:ring-brand-cyan/30 text-sm"
          />
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password" className="text-xs font-semibold text-slate-300">
              Mot de passe
            </FieldLabel>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="h-10 bg-black/40 border-white/10 focus-visible:border-brand-cyan focus-visible:ring-brand-cyan/30 text-sm"
          />
        </Field>

        <Field className="pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-10 font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(0,242,254,0.35)]"
          >
            {isPending ? (
              "Authentification en cours..."
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="size-4" />
                Se connecter
              </span>
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
