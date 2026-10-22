"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Copy, Check, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { removeRosterMember } from "@/app/actions/roster.actions"
import { createInvitation } from "@/app/actions/invitation.actions"

interface RosterManageClientProps {
  rosterId: string
  memberUserId?: string
  currentRole?: string
  isInvitationGenerator?: boolean
}

export function RosterManageClient({
  rosterId,
  memberUserId,
  currentRole,
  isInvitationGenerator,
}: RosterManageClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [inviteCode, setInviteCode] = useState<string | null>(null)

  // 1. Suppression d'un membre
  const handleRemoveMember = async () => {
    if (!memberUserId || !confirm("Voulez-vous vraiment retirer ce joueur de l'équipe ?")) return
    setLoading(true)
    try {
      await removeRosterMember({ roster_id: rosterId, user_id: memberUserId })
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 2. Génération d'une invitation
  const handleGenerateInvite = async () => {
    setLoading(true)
    try {
      const res = await createInvitation({
        target_type_code: "ROSTER",
        target_id: rosterId,
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

  if (isInvitationGenerator) {
    return (
      <div className="space-y-3">
        {inviteCode ? (
          <div className="p-3 rounded-lg bg-black/40 border border-purple-500/30 space-y-2">
            <span className="text-[11px] text-purple-400 font-semibold block">
              Code de recrutement généré :
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
                {copied ? <Check className="size-3 text-purple-400" /> : <Copy className="size-3" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Donnez ce code à votre coéquipier pour qu'il rejoigne l'équipe depuis la page Invitations.
            </p>
          </div>
        ) : (
          <Button
            onClick={handleGenerateInvite}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
          >
            {loading ? <Loader2 className="size-3 animate-spin mr-1" /> : <Plus className="size-3 mr-1" />}
            Générer un code joueur
          </Button>
        )}
      </div>
    )
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={loading}
      onClick={handleRemoveMember}
      className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
      title="Retirer de la lineup"
    >
      <Trash2 className="size-3.5" />
    </Button>
  )
}
