import type { ReactNode } from "react";
import { QuotaGate } from "@/components/plans/quota-gate";

export default function NewStructureLayout({ children }: { children: ReactNode }) {
  return (
    <QuotaGate category="club" quota="clubs">
      {children}
    </QuotaGate>
  );
}
