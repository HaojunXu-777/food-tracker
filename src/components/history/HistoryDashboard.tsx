"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  dateRange,
  formatListDate,
  formatMonthTitle,
  monthCells,
  todayDate,
} from "@/lib/date";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { mealsByDate, summarizeDay, weightsByDate } from "@/lib/history";
import { mealTypeLabel } from "@/lib/meals";
import { formatWeight } from "@/lib/weight";
import { TrendChart } from "@/components/history/TrendChart";
import { IconChevron } from "@/components/ui/Icons";
import type { MealEntry, WeightEntry } from "@/lib/types";

export function HistoryDashboard() {
  const [rangeDays, setRangeDays] = useState<7 | 30>(7);
  const today = todayDate();
  const [year, month] = today.split("-").map(Number);
  const cells = monthCells(year, month - 1);
  const range = dateRange(today, rangeDays);

  const meals = useLiveQuery(
    () => db.meals.toArray(),
    [],
    [] as MealEntry[],
  );
  const weights = useLiveQuery(
    () => db.weights.toArray(),
    [],
    [] as WeightEntry[],
  );
  const settings = useLiveQuery(() => db.settings.get("default"), [], undefined);
  const unit = settings?.weightUnit ?? "kg";

  const mealMap = useMemo(() => mealsByDate(meals), [meals]);
  const weightMap = useMemo(() => weightsByDate(weights), [weights]);

  const caloriePoints = range.map((date) => ({
    date,
    value: summarizeDay(date, mealMap.get(date) ?? []).calories,
  }));

  const weightPoints = range.map((date) => ({
    date,
    value: weightMap.has(date) ? weightMap.get(date)! : null,
  }));

  const markedDates = new Set<string>([...mealMap.keys(), ...weightMap.keys()]);

  const recentDates = [...mealMap.keys()].sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="ft-page px-4 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <h1 className="text-center text-xl font-bold tracking-tight">历史</h1>

      <div className="mx-auto mt-5 flex max-w-xs rounded-full bg-white p-1 shadow-[var(--shadow-soft)]">
        <RangeButton active={rangeDays === 7} onClick={() => setRangeDays(7)}>
          7天
        </RangeButton>
        <RangeButton active={rangeDays === 30} onClick={() => setRangeDays(30)}>
          30天
        </RangeButton>
      </div>

      <section className="ft-card mt-5 px-3 pb-3 pt-4">
        <h2 className="mb-1 px-1 text-sm font-semibold">每日卡路里</h2>
        <p className="mb-2 px-1 text-xs text-[var(--muted)]">kcal 趋势</p>
        <TrendChart
          points={caloriePoints}
          fillEmptyWithZero
          color="var(--accent-cyan)"
        />
      </section>

      <section className="ft-card mt-4 px-3 pb-3 pt-4">
        <h2 className="mb-1 px-1 text-sm font-semibold">体重</h2>
        <p className="mb-2 px-1 text-xs text-[var(--muted)]">体重趋势</p>
        {weightPoints.some((point) => point.value != null) ? (
          <TrendChart
            points={weightPoints}
            fillEmptyWithZero={false}
            formatY={(value) => formatWeight(value, unit).split(" ")[0]}
            color="var(--accent-pink)"
          />
        ) : (
          <p className="py-10 text-center text-sm text-[var(--muted)]">暂无体重记录</p>
        )}
      </section>

      <section className="ft-card mt-4 px-3 py-4">
        <h2 className="mb-3 text-center text-sm font-semibold">
          {formatMonthTitle(today)}
        </h2>
        <div className="grid grid-cols-7 text-center text-xs text-[var(--muted)]">
          {["日", "一", "二", "三", "四", "五", "六"].map((label) => (
            <div key={label} className="py-1">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 text-center text-sm">
          {cells.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="h-11" />;
            const day = Number(date.slice(8, 10));
            const isToday = date === today;
            const marked = markedDates.has(date);
            return (
              <Link
                key={date}
                href={`/history/${date}`}
                className="flex h-11 flex-col items-center justify-center"
              >
                <span
                  className={
                    isToday
                      ? "flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-violet)] text-sm font-semibold text-white"
                      : "flex h-8 w-8 items-center justify-center text-sm font-medium"
                  }
                >
                  {day}
                </span>
                {marked ? (
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[var(--accent-cyan)]" />
                ) : (
                  <span className="mt-0.5 h-1.5 w-1.5" />
                )}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-sm font-semibold">最近记录</h2>
        {recentDates.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">暂无饮食记录</p>
        ) : (
          <div className="space-y-2.5">
            {recentDates.map((date) => {
              const summary = summarizeDay(
                date,
                mealMap.get(date) ?? [],
                weightMap.get(date),
              );
              return (
                <Link
                  key={date}
                  href={`/history/${date}`}
                  className="ft-card-soft flex items-center gap-3 px-4 py-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{formatListDate(date)}</span>
                      <span className="ft-num text-base font-bold">
                        {summary.calories}
                        <span className="ml-1 text-xs font-medium text-[var(--muted)]">
                          kcal
                        </span>
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-[var(--muted)]">
                      {summary.mealTypes
                        .map((type) => mealTypeLabel(type))
                        .join(" · ") || "未记录餐别"}
                    </p>
                  </div>
                  <IconChevron className="h-4 w-4 shrink-0 text-[var(--muted-soft)]" />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function RangeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "flex-1 rounded-full bg-[var(--accent-violet)] py-2 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(139,124,246,0.35)]"
          : "flex-1 rounded-full py-2 text-sm font-medium text-[var(--muted)]"
      }
    >
      {children}
    </button>
  );
}
