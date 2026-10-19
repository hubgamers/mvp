// components/structures/structure-members-view.tsx
import { removeMemberFromStructure, updateStructureMemberRole } from "@/app/actions/structure.actions"
import { AddStructureMemberForm } from "./add-structure-member-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Trash2, ShieldCheck } from "lucide-react"

interface Member {
  id: string
  email: string
  role: string
}

interface StructureMembersProps {
  structureId: string
  members: Member[]
  isAdmin: boolean
}

export function StructureMembersView({ structureId, members, isAdmin }: StructureMembersProps) {
  return (
    <div className="space-y-6">
      {/* Formulaire d'ajout visible uniquement si ADMIN */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inviter un membre dans la structure</CardTitle>
          </CardHeader>
          <CardContent>
            <AddStructureMemberForm structureId={structureId} />
          </CardContent>
        </Card>
      )}

      {/* Liste des membres actuels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Membres de la structure ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member) => {
                const removeAction = removeMemberFromStructure.bind(null, structureId, member.id)
                const updateRoleAction = updateStructureMemberRole.bind(null, structureId, member.id)

                return (
                  <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-4">
                    <div className="flex items-center gap-3 truncate">
                      <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate">{member.email}</span>
                      <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'} className="gap-1">
                        {member.role === 'ADMIN' && <ShieldCheck className="h-3 w-3" />}
                        {member.role}
                      </Badge>
                    </div>

                    {/* Actions d'administration réservées aux ADMINS */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 shrink-0">
                        <form action={updateRoleAction} className="flex items-center gap-2">
                          <select
                            name="role"
                            defaultValue={member.role}
                            className="h-8 text-xs border rounded-md px-2 bg-background"
                          >
                            <option value="USER">Membre</option>
                            <option value="ADMIN">Administrateur</option>
                          </select>
                          <Button type="submit" variant="outline" size="sm" className="h-8 text-xs">
                            Modifier
                          </Button>
                        </form>

                        <form action={removeAction}>
                          <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-6 text-center">
              Aucun membre enregistré.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}