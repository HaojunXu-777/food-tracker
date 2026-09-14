"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "首页" },
  { href: "/diet", label: "饮食" },
  { href: "/history", label: "历史" },
  { href: "/settings", label: "设置" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-[var(--card)]">
      <div className="mx-auto grid max-w-md grid-cols-4 px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-3 text-sm"
            >
              <span
                className={
                  active
                    ? "h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                    : "h-1.5 w-1.5 rounded-full bg-[var(--line)]"
                }
                aria-hidden
              />
              <span className={active ? "font-semibold" : "text-[var(--muted)]"}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
