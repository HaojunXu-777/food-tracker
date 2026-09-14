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
    <div className="ft-page px-2 pb-6">
      <PageHeader
        title={mealTypeLabel(mealType)}
        backHref={backHref}
        action={
          isToday ? (
            <Link
              href={`/diet/${mealType}`}
              className="rounded-full bg-[rgba(240,115,168,0.14)] px-3 py-1.5 text-sm font-semibold text-[var(--accent-pink)]"
            >
              添加
            </Link>
          ) : null
        }
      />

      <div className="px-3 pt-2">
        <p className="text-sm text-[var(--muted)]">{formatDateDisplay(date)}</p>

        {meals.length === 0 ? (
          <div className="ft-card mt-6 px-4 py-10 text-center">
            <p className="text-sm text-[var(--muted)]">未记录</p>
          </div>
        ) : (
          <>
            <div className="ft-card mt-4 p-5">
              <p className="ft-num text-3xl font-bold">
                {roundNutrition(totals.calories)}
                <span className="ml-1 text-sm font-medium text-[var(--accent-cyan)]">
                  kcal
                </span>
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                <span style={{ color: "var(--protein)" }}>P</span>{" "}
                {roundNutrition(totals.protein)}g
                <span className="mx-1.5">·</span>
                <span style={{ color: "var(--carbs)" }}>C</span>{" "}
                {roundNutrition(totals.carbs)}g
                <span className="mx-1.5">·</span>
                <span style={{ color: "var(--fat)" }}>F</span>{" "}
                {roundNutrition(totals.fat)}g
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {meals.map((meal) => {
                const mealTotals = sumFoods(meal.foods);
                return (
                  <article key={meal.id} className="ft-card-soft p-4">
                    <PhotoStrip photoIds={meal.photos} />
                    {meal.foods.map((food) => (
                      <p key={food.id} className="text-sm font-medium">
                        {food.nameZh}
                      </p>
                    ))}
                    <p className="ft-num mt-2 text-lg font-bold">
                      {roundNutrition(mealTotals.calories)}
                      <span className="ml-1 text-xs font-medium text-[var(--muted)]">
                        kcal
                      </span>
                    </p>
                    <div className="mt-3 flex gap-4 text-sm">
                      <Link
                        href={`/diet/${mealType}/manual/${meal.id}`}
                        className="font-semibold text-[var(--accent-violet)]"
                      >
                        编辑
                      </Link>
                      <button
                        type="button"
                        className="font-medium text-[var(--accent-pink)]"
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
