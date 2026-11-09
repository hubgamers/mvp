import type { ReactNode } from "react";
import { QuotaGate } from "@/components/plans/quota-gate";

export default function NewTeamLayout({ children }: { children: ReactNode }) {
  return (
    <QuotaGate category="club" quota="lineups">
      {children}
    </QuotaGate>
  );
}
