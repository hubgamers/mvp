"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Loader2, KeyRound, Copy, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { acceptInvitation, refuseInvitation } from "@/app/actions/invitation.actions"

interface InvitationsClientProps {
  sentInvitations: any[]
  activeInvitations: any[]
}

export function InvitationsClient({ sentInvitations, activeInvitations }: InvitationsClientProps) {
  const router = useRouter()
  const [manualCode, setManualCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleManualAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode.trim()) return

    setLoading(true)
    setFeedback(null)

    try {
      const res = await acceptInvitation(manualCode.trim().toUpperCase())
      if (res.success) {
        setFeedback({ text: res.message, error: false })
        setManualCode("")
        router.refresh()
      } else {
        setFeedback({ text: res.message, error: true })
      }
    } catch (err: any) {
      setFeedback({ text: err.message || "Erreur d'acceptation.", error: true })
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = async (code: string, action: "ACCEPT" | "REFUSE") => {
    setLoading(true)
    setFeedback(null)

    try {
      const res = action === "ACCEPT" ? await acceptInvitation(code) : await refuseInvitation(code)
      if (res.success) {
        setFeedback({ text: res.message, error: false })
        router.refresh()
      } else {
        setFeedback({ text: res.message, error: true })
      }
    } catch (err: any) {
      setFeedback({ text: err.message || "Erreur lors du traitement.", error: true })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Saisie rapide de code */}
      <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <KeyRound className="size-4 text-cyan-400" />
            Rejoindre avec un code d'invitation
          </CardTitle>
          <CardDescription className="text-xs">
            Si un capitaine ou dirigeant vous a transmis un code (ex: X8Y9Z0AB), saisissez-le ci-dessous.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualAccept} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Saisir le code d'invitation..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="bg-black/40 border-white/10 font-mono uppercase text-sm focus-visible:ring-cyan-400 max-w-sm"
            />
            <Button
              type="submit"
              disabled={loading || !manualCode.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Check className="size-3.5 mr-1" />}
              Valider et rejoindre
            </Button>
          </form>

          {feedback && (
            <div
              className={`mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                feedback.error
                  ? "border-red-500/20 bg-red-500/10 text-red-400"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {feedback.error ? <AlertCircle className="size-4 shrink-0" /> : <CheckCircle2 className="size-4 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onglets : Invitations reçues & Envoyées */}
      <Tabs defaultValue="received" className="w-full space-y-4">
        <TabsList className="bg-black/40 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="received" className="text-xs">
            Invitations Disponibles ({activeInvitations.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="text-xs">
            Invitations Générées ({sentInvitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-3">
          {activeInvitations.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-white/10 bg-black/20 text-center text-xs text-muted-foreground">
              Aucune invitation en attente pour le moment.
            </div>
          ) : (
            activeInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-xl bg-card/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono uppercase">
                      {inv.invitation_target_types?.label || inv.target_type_code}
                    </Badge>
                    <span className="font-mono text-xs text-cyan-400 font-bold">{inv.code}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Invité par <strong className="text-white">{inv.users?.display_name || "Un membre"}</strong>
                    {inv.expires_at && ` · Expire le ${new Date(inv.expires_at).toLocaleDateString("fr-FR")}`}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={loading}
                    onClick={() => handleQuickAction(inv.code, "ACCEPT")}
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    <Check className="size-3 mr-1" />
                    Accepter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    onClick={() => handleQuickAction(inv.code, "REFUSE")}
                    className="h-8 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    <X className="size-3 mr-1" />
                    Décliner
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-3">
          {sentInvitations.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-white/10 bg-black/20 text-center text-xs text-muted-foreground">
              Vous n'avez généré aucune invitation pour vos structures ou équipes.
            </div>
          ) : (
            sentInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-xl bg-card/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">
                      {inv.invitation_target_types?.label || inv.target_type_code}
                    </Badge>
                    <Badge
                      className={`text-[10px] ${
                        inv.status === "ACCEPTED"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : inv.status === "REFUSED"
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {inv.status}
                    </Badge>
                  </div>
                  <div className="font-mono text-white text-sm font-bold flex items-center gap-2">
                    <span>{inv.code}</span>
                    <button
                      onClick={() => handleCopy(inv.code)}
                      className="text-muted-foreground hover:text-white"
                      title="Copier le code"
                    >
                      {copiedCode === inv.code ? (
                        <Check className="size-3 text-emerald-400" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-muted-foreground text-right">
                  <div>Créée le {new Date(inv.created_at).toLocaleDateString("fr-FR")}</div>
                  <div>Utilisations : {inv.uses_count || 0} / {inv.max_uses || 1}</div>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
