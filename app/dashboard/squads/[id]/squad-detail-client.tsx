"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Trash2, LogOut, Loader2, Copy, Plus, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { joinSquad, saveSquadMember, removeSquadMember } from "@/app/actions/squad.actions"
import { createInvitation } from "@/app/actions/invitation.actions"

interface SquadDetailClientProps {
  squadId: string
  targetUserId?: string
  isOwner?: boolean
  isMember?: boolean
  isInvited?: boolean
  isSelf?: boolean
  isFull?: boolean
  actionType: "JOIN_OR_LEAVE" | "MANAGE_MEMBER" | "ACCEPT_APPLICANT" | "GENERATE_INVITE"
}

export function SquadDetailClient({
  squadId,
  targetUserId,
  isOwner,
  isMember,
  isInvited,
  isSelf,
  isFull,
  actionType,
}: SquadDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 1. Demander à rejoindre l'escouade
  const handleJoin = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await joinSquad(squadId)
      if (res.success) {
        router.refresh()
      } else {
        setError(res.message)
      }
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la demande d'intégration.")
    } finally {
      setLoading(false)
    }
  }

  // 2. Accepter un postulant (changer son statut en JOINED)
  const handleAccept = async () => {
    if (!targetUserId) return
    setLoading(true)
    try {
      await saveSquadMember({
        squad_id: squadId,
        user_id: targetUserId,
        role_code: "PLAYER",
      })
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 3. Quitter ou expulser
  const handleRemove = async () => {
    if (!confirm(isSelf ? "Voulez-vous vraiment quitter l'escouade ?" : "Voulez-vous expulser ce membre ?")) return
    setLoading(true)
    try {
      await removeSquadMember({
        squad_id: squadId,
        user_id: targetUserId || "",
      })
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 4. Générer un code d'invitation directe
  const handleGenerateInvite = async () => {
    setLoading(true)
    try {
      const res = await createInvitation({
        target_type_code: "SQUAD",
        target_id: squadId,
        max_uses: 1,
        expires_in_days: 7,
      })

      if (res.success && res.invitation) {
        setInviteCode(res.invitation.code)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (!inviteCode) return
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Rendu selon l'actionType
  if (actionType === "GENERATE_INVITE") {
    return (
      <div className="space-y-3">
        {inviteCode ? (
          <div className="p-3 rounded-lg bg-black/40 border border-cyan-500/30 space-y-2">
            <span className="text-[11px] text-cyan-400 font-semibold block">
              Code d'escouade généré (valable 7 jours) :
            </span>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteCode}
                className="w-full bg-black/60 px-3 py-1.5 rounded text-xs font-mono text-white border border-white/10"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyCode}
                className="h-8 shrink-0 text-xs border-white/10"
              >
                {copied ? <Check className="size-3 text-cyan-400" /> : <Copy className="size-3" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Partagez ce code à un ami pour qu'il rejoigne directement votre groupe.
            </p>
          </div>
        ) : (
          <Button
            onClick={handleGenerateInvite}
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Plus className="size-3.5 mr-1" />}
            Générer un code d'invitation
          </Button>
        )}
      </div>
    )
  }

  if (actionType === "ACCEPT_APPLICANT") {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          disabled={loading}
          onClick={handleAccept}
          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
        >
          {loading ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3 mr-1" />}
          Accepter
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={handleRemove}
          className="h-8 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
        >
          <X className="size-3" />
        </Button>
      </div>
    )
  }

  if (actionType === "MANAGE_MEMBER") {
    // Si c'est soi-même ou si c'est l'owner expulsant un membre (mais pas lui-même)
    if (!isSelf && !isOwner) return null
    if (isSelf && isOwner) return null // L'owner ne se quitte pas lui-même ainsi

    return (
      <Button
        size="sm"
        variant="ghost"
        disabled={loading}
        onClick={handleRemove}
        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        title={isSelf ? "Quitter le groupe" : "Expulser"}
      >
        {isSelf ? <LogOut className="size-3.5" /> : <Trash2 className="size-3.5" />}
      </Button>
    )
  }

  // actionType === "JOIN_OR_LEAVE"
  return (
    <div className="space-y-3">
      {isOwner ? (
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">
          Vous êtes le chef de cette escouade. Vous pouvez valider les postulants et gérer les membres.
        </div>
      ) : isMember ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>Vous faites partie de cette escouade.</span>
          </div>
          <Button
            variant="outline"
            disabled={loading}
            onClick={handleRemove}
            className="w-full text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="size-3.5 mr-1" />
            Quitter l'escouade
          </Button>
        </div>
      ) : isInvited ? (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
          Votre demande d'intégration est en attente d'approbation par le chef d'escouade.
        </div>
      ) : isFull ? (
        <Button disabled className="w-full text-xs bg-white/10 text-muted-foreground">
          Escouade complète
        </Button>
      ) : (
        <Button
          onClick={handleJoin}
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Plus className="size-3.5 mr-1" />}
          Postuler / Rejoindre l'escouade
        </Button>
      )}

      {error && (
        <div className="p-2 rounded border border-red-500/20 bg-red-500/10 text-red-400 text-xs flex items-center gap-1.5">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
