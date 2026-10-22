'use client'

import { useActionState, useState } from "react"
import { signup } from "@/app/actions/auth.actions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Sparkles } from "lucide-react"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [state, formAction, isPending] = useActionState(signup, null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [clientError, setClientError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (password !== confirmPassword) {
      e.preventDefault()
      setClientError("Les mots de passe ne correspondent pas.")
      return
    }
    setClientError(null)
  }

  return (
    <form 
      action={formAction} 
      onSubmit={handleSubmit} 
      className={cn("flex flex-col gap-5", className)} 
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1.5 text-center mb-1">
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            Créer un compte
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs">
            Rejoignez HubGamers pour organiser des tournois ou inscrire votre équipe.
          </p>
        </div>

        {(clientError || state?.error) && (
          <div className="p-3 text-xs font-medium text-red-400 bg-red-500/10 rounded-lg border border-red-500/20 text-center animate-in fade-in-50">
            {clientError || state?.error}
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
          <FieldLabel htmlFor="password" className="text-xs font-semibold text-slate-300">
            Mot de passe
          </FieldLabel>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 bg-black/40 border-white/10 focus-visible:border-brand-cyan focus-visible:ring-brand-cyan/30 text-sm"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password" className="text-xs font-semibold text-slate-300">
            Confirmer le mot de passe
          </FieldLabel>
          <Input 
            id="confirm-password" 
            name="confirm-password" 
            type="password" 
            required 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
              "Création du compte..."
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="size-4" />
                Créer mon compte
              </span>
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
