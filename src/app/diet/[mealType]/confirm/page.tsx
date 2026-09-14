"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { notFound, useParams } from "next/navigation";
import { ManualMealForm } from "@/components/diet/ManualMealForm";
import { PageHeader } from "@/components/PageHeader";
import { isMealType, mealTypeLabel } from "@/lib/meals";
import { lookupNutrition } from "@/lib/nutritionLookup";
import { getPhotosByMealId } from "@/lib/photoStore";
import type { NutritionSearchItem } from "@/lib/nutrition";

type AiFood = { nameZh: string; usda: NutritionSearchItem | null };

export default function ConfirmMealPage() {
  return (
    <Suspense fallback={<p className="px-4 pt-8 text-sm text-[var(--muted)]">加载中…</p>}>
      <ConfirmMealInner />
    </Suspense>
  );
}

function ConfirmMealInner() {
  const params = useParams<{ mealType: string }>();
  const searchParams = useSearchParams();
  const mealType = params.mealType;
  const draft = searchParams.get("draft") ?? "";
  const [foods, setFoods] = useState<AiFood[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const raw = sessionStorage.getItem(`ai-foods:${draft}`);
      const names = raw ? (JSON.parse(raw) as { nameZh?: string }[]) : [];
      const photos = await getPhotosByMealId(`draft:${draft}`);
      if (photos.length === 0 && names.length === 0) {
        if (!cancelled) setFoods([]);
        return;
      }
      const resolved: AiFood[] = [];
      for (const item of names) {
        const nameZh = item.nameZh?.trim();
        if (!nameZh) continue;
        const usda = await lookupNutrition(nameZh);
        resolved.push({ nameZh, usda });
      }
      if (!cancelled) setFoods(resolved);
    }
    if (draft) void load();
    else setFoods([]);
    return () => {
      cancelled = true;
    };
  }, [draft]);

  if (!isMealType(mealType)) {
    notFound();
  }

  if (!draft) {
    return <p className="px-4 pt-8 text-sm">缺少照片草稿，请返回重新拍照。</p>;
  }

  if (foods === null) {
    return <p className="px-4 pt-8 text-sm text-[var(--muted)]">正在匹配营养数据…</p>;
  }

  return (
    <div>
      <PageHeader title={`确认${mealTypeLabel(mealType)}`} backHref={`/diet/${mealType}/photo`} />
      <p className="px-4 pt-2 text-sm text-[var(--muted)]">
        AI 已识别 {foods.length} 种食物
      </p>
      <ManualMealForm
        mealType={mealType}
        photoMealKey={`draft:${draft}`}
        enableEstimateWeight
        aiFoods={foods}
      />
    </div>
  );
}
