"use client";

import Link from "next/link";
import { db } from "@/lib/db";
import { todayDate } from "@/lib/date";
import { useLiveQuery } from "@/hooks/useLiveQuery";
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
    <div className="px-4 pt-6">
      <h1 className="text-center text-xl font-semibold">饮食</h1>
      <p className="mt-8 text-base">今天要记录哪一餐？</p>
      <div className="mt-4 space-y-3">
        {MEAL_TYPES.map(({ type, label }) => {
          const group = meals.filter((meal) => meal.mealType === type);
          const recorded = group.length > 0;
          const calories = roundNutrition(sumMeals(group).calories);

          return (
            <Link
              key={type}
              href={`/diet/${type}`}
              className="block rounded-xl border border-[var(--line)] px-4 py-4"
            >
              <div className="flex items-start justify-between">
                <span className="font-medium">{label}</span>
                <span className="text-sm text-[var(--muted)]">
                  {recorded ? `${calories} kcal` : "未记录"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-[var(--muted)]">
                <span>{recorded ? "已记录" : ""}</span>
                <span>&gt;</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
