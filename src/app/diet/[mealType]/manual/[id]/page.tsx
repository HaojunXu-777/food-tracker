"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { ManualMealForm } from "@/components/diet/ManualMealForm";
import { PageHeader } from "@/components/PageHeader";
import { getMeal } from "@/lib/mealStore";
import { isMealType, mealTypeLabel } from "@/lib/meals";
import type { MealEntry } from "@/lib/types";

export default function ManualEditPage() {
  const params = useParams<{ mealType: string; id: string }>();
  const mealType = params.mealType;
  const id = params.id;
  const [meal, setMeal] = useState<MealEntry | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    getMeal(id).then((entry) => {
      if (!cancelled) setMeal(entry ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!isMealType(mealType)) {
    notFound();
  }

  if (meal === undefined) {
    return (
      <p className="ft-page px-4 pt-8 text-sm text-[var(--muted)]">加载中…</p>
    );
  }

  if (meal === null || meal.mealType !== mealType) {
    return <p className="ft-page px-4 pt-8 text-sm">记录不存在</p>;
  }

  return (
    <div className="ft-page">
      <PageHeader title="编辑" backHref={`/diet/${mealType}/today`} />
      <p className="px-4 pt-1 text-sm text-[var(--muted)]">{mealTypeLabel(mealType)}</p>
      <ManualMealForm
        mealType={mealType}
        mealId={meal.id}
        initialMeal={meal}
        photoMealKey={meal.id}
        enableEstimateWeight={meal.photos.length > 0}
      />
    </div>
  );
}
