"use client";

import Link from "next/link";
import { db } from "@/lib/db";
import { todayDate } from "@/lib/date";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { IconChevron, MealGlyph } from "@/components/ui/Icons";
import { mealAccent } from "@/components/ui/mealAccent";
import { MEAL_TYPES, roundNutrition, sumMeals } from "@/lib/meals";
import type { MealEntry } from "@/lib/types";

export default function DietPage() {
  const date = todayDate();
  const meals = useLiveQuery(
    () => db.meals.where("date").equals(date).toArray(),
    [date],
    [] as MealEntry[],
  );

  return (
    <div className="ft-page px-4 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <h1 className="text-center text-xl font-bold tracking-tight">饮食</h1>
      <p className="mt-2 text-center text-sm text-[var(--muted)]">
        今天要记录哪一餐？
      </p>

      <div className="mt-6 space-y-3">
        {MEAL_TYPES.map(({ type, label }) => {
          const group = meals.filter((meal) => meal.mealType === type);
          const recorded = group.length > 0;
          const totals = sumMeals(group);
          const calories = roundNutrition(totals.calories);
          const accent = mealAccent(type);

          return (
            <Link
              key={type}
              href={`/diet/${type}`}
              className="ft-card-soft flex items-center gap-3 px-4 py-4"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: accent.soft, color: accent.color }}
              >
                <MealGlyph type={type} className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-semibold">{label}</span>
                  {recorded ? (
                    <span className="ft-num text-base font-bold">
                      {calories}
                      <span className="ml-1 text-xs font-medium text-[var(--muted)]">
                        kcal
                      </span>
                    </span>
                  ) : (
                    <span className="rounded-full bg-[var(--input-bg)] px-2.5 py-0.5 text-xs text-[var(--muted)]">
                      未记录
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {recorded
                    ? `P ${roundNutrition(totals.protein)}g · C ${roundNutrition(totals.carbs)}g · F ${roundNutrition(totals.fat)}g`
                    : "选择拍照或手动添加"}
                </p>
              </div>
              <IconChevron className="h-4 w-4 text-[var(--muted-soft)]" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
