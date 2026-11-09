import type { ReactNode } from "react";
import { QuotaGate } from "@/components/plans/quota-gate";

export default function NewSquadLayout({ children }: { children: ReactNode }) {
  return (
    <QuotaGate category="player" quota="squadsCreated">
      {children}
    </QuotaGate>
  );
}
