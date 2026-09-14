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
import { IconChevron, MealGlyph } from "@/components/ui/Icons";
import { mealAccent } from "@/components/ui/mealAccent";
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
    <div className="ft-page px-2 pb-6">
      <PageHeader title="当天详情" backHref="/history" />
      <div className="px-3 pt-2">
        <p className="text-sm text-[var(--muted)]">{formatDateDisplay(date)}</p>
        <div className="ft-card mt-4 p-5">
          <p className="ft-num text-3xl font-bold">
            {summary.calories}
            <span className="ml-1 text-sm font-medium text-[var(--accent-cyan)]">kcal</span>
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            <span style={{ color: "var(--protein)" }}>P</span> {summary.protein}g
            <span className="mx-1.5">·</span>
            <span style={{ color: "var(--carbs)" }}>C</span> {summary.carbs}g
            <span className="mx-1.5">·</span>
            <span style={{ color: "var(--fat)" }}>F</span> {summary.fat}g
          </p>
          <p className="mt-3 text-sm">
            当天体重{" "}
            {weight ? (
              <span className="font-semibold">{formatWeight(weight.weightKg, unit)}</span>
            ) : (
              <span className="text-[var(--muted)]">未记录</span>
            )}
          </p>
        </div>

        <div className="mt-4 space-y-2.5">
          {MEAL_TYPES.map(({ type, label }) => {
            const group = meals.filter((meal) => meal.mealType === type);
            const recorded = group.length > 0;
            const totals = sumMeals(group);
            const accent = mealAccent(type);
            return (
              <Link
                key={type}
                href={`/diet/${type}/today?date=${date}`}
                className="ft-card-soft flex items-center gap-3 px-4 py-3.5"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: accent.soft, color: accent.color }}
                >
                  <MealGlyph type={type} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-semibold">{label}</h2>
                    {recorded ? (
                      <span className="ft-num font-bold">
                        {roundNutrition(totals.calories)}
                        <span className="ml-1 text-xs font-medium text-[var(--muted)]">
                          kcal
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">未记录</span>
                    )}
                  </div>
                  {recorded ? (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      P {roundNutrition(totals.protein)}g · C {roundNutrition(totals.carbs)}g · F{" "}
                      {roundNutrition(totals.fat)}g
                    </p>
                  ) : null}
                </div>
                <IconChevron className="h-4 w-4 text-[var(--muted-soft)]" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
