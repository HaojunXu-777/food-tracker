"use client";

import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateDisplay, todayDate } from "@/lib/date";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { CalorieRing } from "@/components/home/CalorieRing";
import { MacroBar } from "@/components/home/MacroBar";
import { IconChevron, IconScale, MealGlyph } from "@/components/ui/Icons";
import { mealAccent } from "@/components/ui/mealAccent";
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
    <div className="ft-page">
      <section className="ft-hero px-5 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-[0.08em] text-white/55">
              个人饮食记录
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">今日饮食</h1>
            <time className="mt-1 block text-sm text-white/65">
              {formatDateDisplay(date)}
            </time>
          </div>
          <Link
            href="/weight"
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(245,192,66,0.2)] text-[var(--accent-yellow)]">
              <IconScale className="h-4 w-4" />
            </span>
            <div className="min-w-0 text-left">
              <p className="text-[10px] uppercase tracking-wide text-white/55">体重</p>
              <p className="ft-num truncate text-sm font-semibold">
                {weight ? formatWeight(weight.weightKg, unit) : "未记录"}
              </p>
            </div>
            <IconChevron className="h-4 w-4 text-white/45" />
          </Link>
        </div>
      </section>

      <section className="relative z-10 -mt-10 px-4">
        <div className="ft-card px-4 pb-5 pt-6">
          <CalorieRing current={calories} goal={goals?.calories} />
          {remaining != null ? (
            <div className="mt-3 flex justify-center">
              <span className="rounded-full bg-[rgba(46,196,182,0.12)] px-3 py-1 text-sm font-medium text-[var(--accent-cyan)]">
                剩余 {remaining} kcal
              </span>
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            <MacroBar
              label="蛋白质"
              current={roundNutrition(totals.protein)}
              goal={goals?.protein}
              color="var(--protein)"
            />
            <MacroBar
              label="碳水"
              current={roundNutrition(totals.carbs)}
              goal={goals?.carbs}
              color="var(--carbs)"
            />
            <MacroBar
              label="脂肪"
              current={roundNutrition(totals.fat)}
              goal={goals?.fat}
              color="var(--fat)"
            />
          </div>
        </div>
      </section>

      <section className="px-4 pb-6 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">今日餐别</h2>
          <Link href="/diet" className="text-sm font-medium text-[var(--accent-violet)]">
            去记录
          </Link>
        </div>
        <div className="space-y-3">
          {MEAL_TYPES.map(({ type, label }) => {
            const group = meals.filter((meal) => meal.mealType === type);
            const groupTotals = sumMeals(group);
            const recorded = group.length > 0;
            const accent = mealAccent(type);

            return (
              <Link key={type} href={`/diet/${type}/today`} className="block">
                <article
                  className={
                    recorded
                      ? "ft-card-soft flex items-center gap-3 px-4 py-3.5"
                      : "ft-card-soft flex items-center gap-3 px-4 py-3.5 opacity-80"
                  }
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: accent.soft, color: accent.color }}
                  >
                    <MealGlyph type={type} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold">{label}</h3>
                      {recorded ? (
                        <p className="ft-num text-base font-bold text-[var(--foreground)]">
                          {roundNutrition(groupTotals.calories)}
                          <span className="ml-1 text-xs font-medium text-[var(--muted)]">
                            kcal
                          </span>
                        </p>
                      ) : (
                        <span className="rounded-full bg-[var(--input-bg)] px-2.5 py-0.5 text-xs text-[var(--muted)]">
                          未记录
                        </span>
                      )}
                    </div>
                    {recorded ? (
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        <span style={{ color: "var(--protein)" }}>P</span>{" "}
                        {roundNutrition(groupTotals.protein)}g
                        <span className="mx-1.5 text-[var(--muted-soft)]">·</span>
                        <span style={{ color: "var(--carbs)" }}>C</span>{" "}
                        {roundNutrition(groupTotals.carbs)}g
                        <span className="mx-1.5 text-[var(--muted-soft)]">·</span>
                        <span style={{ color: "var(--fat)" }}>F</span>{" "}
                        {roundNutrition(groupTotals.fat)}g
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-[var(--muted)]">轻点开始记录这一餐</p>
                    )}
                  </div>
                  <IconChevron className="h-4 w-4 shrink-0 text-[var(--muted-soft)]" />
                </article>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
