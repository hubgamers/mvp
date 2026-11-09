'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Loader2 } from "lucide-react"
import { startDirectConversation } from "@/app/actions/message.actions"

interface MessageButtonProps {
  recipientId: string
}

export function MessageButton({ recipientId }: MessageButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartConversation = async () => {
    setError(null)
    setLoading(true)

    try {
      const result = await startDirectConversation(recipientId)

      if (result.success && result.conversationId) {
        startTransition(() => {
          router.push(`/dashboard/messages?conversation=${result.conversationId}`)
        })
      } else {
        setError(result.message || "Une erreur est survenue.")
      }
    } catch (err) {
      console.error("Erreur handleStartConversation:", err)
      setError("Impossible de démarrer la conversation.")
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = loading || isPending

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleStartConversation}
        disabled={isDisabled}
        className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-400 disabled:opacity-50"
      >
        {isDisabled ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <MessageSquare className="size-4" />
        )}
        <span>Envoyer un message</span>
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}