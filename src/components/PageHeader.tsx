import Link from "next/link";
import type { ReactNode } from "react";
import { IconBack } from "@/components/ui/Icons";

type PageHeaderProps = {
  title: string;
  backHref: string;
  action?: ReactNode;
  tone?: "light" | "dark";
};

export function PageHeader({
  title,
  backHref,
  action,
  tone = "light",
}: PageHeaderProps) {
  const dark = tone === "dark";
  return (
    <header
      className={
        dark
          ? "grid grid-cols-[2.75rem_1fr_2.75rem] items-center px-3 pt-[max(1rem,env(safe-area-inset-top))] pb-3 text-white"
          : "grid grid-cols-[2.75rem_1fr_2.75rem] items-center px-3 pt-[max(1rem,env(safe-area-inset-top))] pb-2"
      }
    >
      <Link
        href={backHref}
        className={
          dark
            ? "flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10"
            : "flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[var(--shadow-soft)]"
        }
        aria-label="返回"
      >
        <IconBack className="h-5 w-5" />
      </Link>
      <h1
        className={
          dark
            ? "text-center text-lg font-semibold tracking-tight"
            : "text-center text-lg font-semibold tracking-tight text-[var(--foreground)]"
        }
      >
        {title}
      </h1>
      <div className="flex justify-end text-sm font-medium">{action}</div>
    </header>
  );
}
