"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDiet,
  IconHistory,
  IconHome,
  IconSettings,
} from "@/components/ui/Icons";

const items = [
  { href: "/", label: "首页", Icon: IconHome },
  { href: "/diet", label: "饮食", Icon: IconDiet },
  { href: "/history", label: "历史", Icon: IconHistory },
  { href: "/settings", label: "设置", Icon: IconSettings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-md px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="rounded-[1.35rem] bg-white/95 px-1 pt-2 shadow-[0_-8px_30px_rgba(26,21,72,0.12)] backdrop-blur-md">
          <div className="grid grid-cols-4">
            {items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.Icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-[3.4rem] flex-col items-center justify-center gap-1 rounded-2xl"
                >
                  <span
                    className={
                      active
                        ? "flex h-9 w-9 items-center justify-center rounded-2xl bg-[rgba(46,196,182,0.14)]"
                        : "flex h-9 w-9 items-center justify-center"
                    }
                  >
                    <Icon className="h-5 w-5" active={active} />
                  </span>
                  <span
                    className={
                      active
                        ? "text-[11px] font-semibold text-[var(--accent-cyan)]"
                        : "text-[11px] text-[var(--muted)]"
                    }
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
