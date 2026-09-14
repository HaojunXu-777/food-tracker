"use client";

import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateDisplay, todayDate } from "@/lib/date";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { CalorieRing } from "@/components/home/CalorieRing";
import { MacroBar } from "@/components/home/MacroBar";
import {
  MEAL_TYPES,
  roundNutrition,
  sumMeals,
} from "@/lib/meals";
import { formatWeight } from "@/lib/weight";
import type { MealEntry } from "@/lib/types";

export function HomeDashboard() {
  const date = todayDate();
  const meals = useLiveQuery(
    () => db.meals.where("date").equals(date).toArray(),
    [date],
    [] as MealEntry[],
  );
  const weight = useLiveQuery(() => db.weights.get(date), [date], undefined);
  const goals = useLiveQuery(() => db.goals.get("default"), [], undefined);
  const settings = useLiveQuery(() => db.settings.get("default"), [], undefined);
  const unit = settings?.weightUnit ?? "kg";

  const totals = sumMeals(meals);
  const calories = roundNutrition(totals.calories);
  const remaining =
    goals?.calories != null && goals.calories > 0
      ? goals.calories - calories
      : null;

  return (
    <div className="px-4 pt-6">
      <header className="flex items-start justify-between">
        <h1 className="text-xl font-semibold">今日饮食</h1>
        <time className="text-sm text-[var(--muted)]">{formatDateDisplay(date)}</time>
      </header>

      <Link href="/weight" className="mt-2 flex items-center justify-between">
        {weight ? (
          <>
            <p className="text-sm">
              今日体重 <span className="font-medium">{formatWeight(weight.weightKg, unit)}</span>
            </p>
            <span className="text-sm text-[var(--muted)]">编辑 &gt;</span>
          </>
        ) : (
          <>
            <p className="text-sm">
              今日体重 <span className="text-[var(--muted)]">未记录</span>
            </p>
            <span className="text-sm text-[var(--muted)]">＋记录</span>
          </>
        )}
      </Link>

      <section className="mt-6">
        <CalorieRing current={calories} goal={goals?.calories} />
        {remaining != null ? (
          <p className="mt-3 text-center text-sm">剩余 {remaining} kcal</p>
        ) : null}

        <div className="mt-6 space-y-3">
          <MacroBar label="蛋白质" current={roundNutrition(totals.protein)} goal={goals?.protein} />
          <MacroBar label="碳水" current={roundNutrition(totals.carbs)} goal={goals?.carbs} />
          <MacroBar label="脂肪" current={roundNutrition(totals.fat)} goal={goals?.fat} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold">今日饮食</h2>
        <div className="space-y-3">
          {MEAL_TYPES.map(({ type, label }) => {
            const group = meals.filter((meal) => meal.mealType === type);
            const groupTotals = sumMeals(group);
            const recorded = group.length > 0;

            return (
              <Link key={type} href={`/diet/${type}/today`} className="block">
                <article className="rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{label}</h3>
                    {!recorded ? (
                      <span className="text-sm text-[var(--muted)]">未记录</span>
                    ) : null}
                  </div>
                  {recorded ? (
                    <>
                      <p className="mt-1 text-sm">{roundNutrition(groupTotals.calories)} kcal</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        蛋白质 {roundNutrition(groupTotals.protein)}g  碳水{" "}
                        {roundNutrition(groupTotals.carbs)}g  脂肪{" "}
                        {roundNutrition(groupTotals.fat)}g
                      </p>
                    </>
                  ) : null}
                </article>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
