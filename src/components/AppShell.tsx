import type { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col bg-[var(--card)]">
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
