import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  getPlanEntitlements,
  planLimitMessage,
  type PlanCategory,
} from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Quota = "squadsCreated" | "activeTournaments" | "clubs" | "lineups";

const quotaLabels: Record<Quota, string> = {
  squadsCreated: "Squads créées",
  activeTournaments: "Tournois actifs",
  clubs: "Structures",
  lineups: "Line-ups",
};

export async function QuotaGate({
  category,
  quota,
  children,
}: {
  category: PlanCategory;
  quota: Quota;
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const entitlements = await getPlanEntitlements(user.id, category);
  const limit = entitlements[quota];
  const used = await getUsage(user.id, quota);

  if (used < limit) return children;

  return (
    <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
      <Card className="border-white/10 bg-card/70">
        <CardHeader>
          <CardTitle>Limite de votre offre atteinte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>{planLimitMessage(quotaLabels[quota], limit, category)}</p>
          <Button asChild>
            <Link href={`/dashboard/billing?category=${category}`}>
              Voir les offres
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

async function getUsage(userId: string, quota: Quota) {
  switch (quota) {
    case "squadsCreated":
      return prisma.squads_members.count({
        where: { user_id: userId, role_code: "OWNER" },
      });
    case "activeTournaments":
      return prisma.tournaments.count({
        where: {
          status_code: { notIn: ["FINISHED", "COMPLETED", "CANCELLED"] },
          tournaments_members: { some: { user_id: userId, role_code: "ADMIN" } },
        },
      });
    case "clubs":
      return prisma.clubs.count({
        where: {
          deleted: false,
          clubs_members: {
            some: {
              user_id: userId,
              role_code: { in: ["ADMIN", "OWNER"] },
            },
          },
        },
      });
    case "lineups":
      return prisma.rosters.count({
        where: {
          deleted: false,
          rosters_members: { some: { user_id: userId, role_code: "CAPTAIN" } },
        },
      });
    default:
      throw new Error(`Quota non pris en charge : ${quota}`);
  }
}
