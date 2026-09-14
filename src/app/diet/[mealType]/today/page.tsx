"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PhotoStrip } from "@/components/diet/PhotoStrip";
import { PageHeader } from "@/components/PageHeader";
import { db } from "@/lib/db";
import { formatDateDisplay, isISODate, todayDate } from "@/lib/date";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { deleteMeal } from "@/lib/mealStore";
import {
  isMealType,
  mealTypeLabel,
  roundNutrition,
  sumFoods,
  sumMeals,
} from "@/lib/meals";
import type { MealEntry } from "@/lib/types";

export default function MealTodayPage() {
  const params = useParams<{ mealType: string }>();
  const searchParams = useSearchParams();
  const mealType = params.mealType;
  const dateParam = searchParams.get("date");
  const date = dateParam && isISODate(dateParam) ? dateParam : todayDate();
  const isToday = date === todayDate();
  const fromHistory = Boolean(dateParam && isISODate(dateParam));
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const meals = useLiveQuery(
    (): Promise<MealEntry[]> =>
      isMealType(mealType)
        ? db.meals
            .where("[date+mealType]")
            .equals([date, mealType])
            .sortBy("createdAt")
        : Promise.resolve([]),
    [date, mealType],
    [] as MealEntry[],
  );

  if (!isMealType(mealType)) {
    notFound();
  }

  const totals = sumMeals(meals);
  const backHref = fromHistory ? `/history/${date}` : "/";

  return (
    <div className="px-2">
      <PageHeader
        title={mealTypeLabel(mealType)}
        backHref={backHref}
        action={
          isToday ? (
            <Link href={`/diet/${mealType}`} className="text-sm">
              添加
            </Link>
          ) : null
        }
      />

      <div className="px-2 pt-4">
        <p className="text-sm text-[var(--muted)]">{formatDateDisplay(date)}</p>

        {meals.length === 0 ? (
          <p className="mt-8 text-sm text-[var(--muted)]">未记录</p>
        ) : (
          <>
            <p className="mt-4 text-2xl font-semibold">
              {roundNutrition(totals.calories)} kcal
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              蛋白质 {roundNutrition(totals.protein)}g  碳水 {roundNutrition(totals.carbs)}g  脂肪{" "}
              {roundNutrition(totals.fat)}g
            </p>

            <div className="mt-6 space-y-3">
              {meals.map((meal) => {
                const mealTotals = sumFoods(meal.foods);
                return (
                  <article
                    key={meal.id}
                    className="rounded-xl border border-[var(--line)] p-4"
                  >
                    <PhotoStrip photoIds={meal.photos} />
                    {meal.foods.map((food) => (
                      <p key={food.id} className="text-sm">
                        {food.nameZh}
                      </p>
                    ))}
                    <p className="mt-2 text-sm">
                      {roundNutrition(mealTotals.calories)} kcal
                    </p>
                    <div className="mt-3 flex gap-4 text-sm">
                      <Link
                        href={`/diet/${mealType}/manual/${meal.id}`}
                        className="font-medium"
                      >
                        编辑
                      </Link>
                      <button
                        type="button"
                        className="text-red-600"
                        onClick={() => setDeleteId(meal.id)}
                      >
                        删除
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={deleteId != null}
        message="确定删除这条记录吗？"
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await deleteMeal(deleteId);
          }
          setDeleteId(null);
        }}
      />
    </div>
  );
}
