"use client";

import { notFound, useParams } from "next/navigation";
import { ManualMealForm } from "@/components/diet/ManualMealForm";
import { PageHeader } from "@/components/PageHeader";
import { isMealType, mealTypeLabel } from "@/lib/meals";

export default function ManualAddPage() {
  const params = useParams<{ mealType: string }>();
  const mealType = params.mealType;

  if (!isMealType(mealType)) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="手动添加" backHref={`/diet/${mealType}`} />
      <p className="px-4 pt-2 text-sm text-[var(--muted)]">{mealTypeLabel(mealType)}</p>
      <ManualMealForm mealType={mealType} />
    </div>
  );
}
