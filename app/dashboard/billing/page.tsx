import { CreditCard } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function BillingPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Facturation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez votre abonnement et vos moyens de paiement.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CreditCard className="size-5" />
          </div>
          <CardTitle>La facturation arrive bientôt</CardTitle>
          <CardDescription>
            La gestion des abonnements et des paiements n’est pas encore
            disponible sur HubGamers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucun moyen de paiement ni abonnement ne peut être ajouté ou modifié
            depuis cet espace pour le moment.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
