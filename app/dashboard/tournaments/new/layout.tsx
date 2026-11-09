import type { ReactNode } from "react";
import { QuotaGate } from "@/components/plans/quota-gate";

export default function NewTournamentLayout({ children }: { children: ReactNode }) {
  return (
    <QuotaGate category="organizer" quota="activeTournaments">
      {children}
    </QuotaGate>
  );
}
