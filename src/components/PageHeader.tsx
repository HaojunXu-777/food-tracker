import Link from "next/link";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  backHref: string;
  action?: ReactNode;
};

export function PageHeader({ title, backHref, action }: PageHeaderProps) {
  return (
    <header className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center px-2 pt-4">
      <Link href={backHref} className="px-2 text-lg" aria-label="返回">
        ←
      </Link>
      <h1 className="text-center text-lg font-semibold">{title}</h1>
      <div className="text-right text-sm">{action}</div>
    </header>
  );
}
