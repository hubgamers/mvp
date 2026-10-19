'use client'

import { useActionState } from "react"
import { login } from "@/app/actions/auth.actions" // Ajuste le chemin selon ton dossier
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  // Gestion de l'état de l'action (erreurs)
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <form action={formAction} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>

        {/* Affichage propre de l'erreur si elle existe */}
        {state?.error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20 text-center">
            {state.error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </Field>
        
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" name="password" type="password" required />
        </Field>

        <Field>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Connexion en cours..." : "Login"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>
        
        <Field>
          <Button variant="outline" type="button" className="w-full">
            Login with GitHub
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a href="/register" className="underline underline-offset-4">
              Sign up
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}