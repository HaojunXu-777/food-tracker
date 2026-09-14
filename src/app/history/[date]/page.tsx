"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { db } from "@/lib/db";
import { formatDateDisplay, isISODate } from "@/lib/date";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { summarizeDay } from "@/lib/history";
import { MEAL_TYPES, roundNutrition, sumMeals } from "@/lib/meals";
import { formatWeight } from "@/lib/weight";
import type { MealEntry, WeightEntry } from "@/lib/types";

export default function HistoryDayPage() {
  const params = useParams<{ date: string }>();
  const date = params.date;

  const meals = useLiveQuery(
    (): Promise<MealEntry[]> =>
      isISODate(date) ? db.meals.where("date").equals(date).toArray() : Promise.resolve([]),
    [date],
    [] as MealEntry[],
  );
  const weight = useLiveQuery<WeightEntry | undefined>(
    () => (isISODate(date) ? db.weights.get(date) : Promise.resolve(undefined)),
    [date],
    undefined,
  );
  const settings = useLiveQuery(() => db.settings.get("default"), [], undefined);

  if (!isISODate(date)) {
    notFound();
  }

  const summary = summarizeDay(date, meals, weight?.weightKg);
  const unit = settings?.weightUnit ?? "kg";

  return (
    <div className="px-2">
      <PageHeader title="当天详情" backHref="/history" />
      <div className="px-2 pt-4 pb-8">
        <p className="text-sm text-[var(--muted)]">{formatDateDisplay(date)}</p>
        <p className="mt-4 text-2xl font-semibold">{summary.calories} kcal</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          蛋白质 {summary.protein}g  碳水 {summary.carbs}g  脂肪 {summary.fat}g
        </p>
        <p className="mt-3 text-sm">
          当天体重{" "}
          {weight
            ? formatWeight(weight.weightKg, unit)
            : <span className="text-[var(--muted)]">未记录</span>}
        </p>

        <div className="mt-6 space-y-3">
          {MEAL_TYPES.map(({ type, label }) => {
            const group = meals.filter((meal) => meal.mealType === type);
            const recorded = group.length > 0;
            const totals = sumMeals(group);
            return (
              <Link
                key={type}
                href={`/diet/${type}/today?date=${date}`}
                className="block rounded-xl border border-[var(--line)] px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-medium">{label}</h2>
                  {!recorded ? (
                    <span className="text-sm text-[var(--muted)]">未记录</span>
                  ) : null}
                </div>
                {recorded ? (
                  <>
                    <p className="mt-1 text-sm">{roundNutrition(totals.calories)} kcal</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      蛋白质 {roundNutrition(totals.protein)}g  碳水 {roundNutrition(totals.carbs)}g  脂肪{" "}
                      {roundNutrition(totals.fat)}g
                    </p>
                  </>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
