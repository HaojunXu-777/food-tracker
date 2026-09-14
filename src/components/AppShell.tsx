import type { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-[var(--bg-deep)]">
      <div className="relative mx-auto flex min-h-full max-w-md flex-col overflow-x-hidden bg-[var(--surface)] shadow-[0_0_60px_rgba(0,0,0,0.35)]">
        <main className="flex-1 pb-[calc(5.25rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
