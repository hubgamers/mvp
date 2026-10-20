// components/auth-toast-listener.tsx
"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function AuthToastListener() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get("error")

    if (error === "unauthorized") {
      toast.error("Accès restreint", {
        id: "auth-required-toast",
        description: "Vous devez être administrateur pour accéder à cette page.",
        duration: 5000,
      })
    }
  }, [searchParams])

  return null // Ce composant n'affiche rien visuellement, il écoute juste l'URL
}