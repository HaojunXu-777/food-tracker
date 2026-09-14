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
    <div className="px-4 pt-6 pb-8">
      <h1 className="text-center text-xl font-semibold">历史</h1>

      <div className="mt-6 flex justify-center gap-3">
        <RangeButton active={rangeDays === 7} onClick={() => setRangeDays(7)}>
          7天
        </RangeButton>
        <RangeButton active={rangeDays === 30} onClick={() => setRangeDays(30)}>
          30天
        </RangeButton>
      </div>

      <section className="mt-6">
        <h2 className="mb-2 font-medium">每日卡路里</h2>
        <TrendChart points={caloriePoints} fillEmptyWithZero />
      </section>

      <div className="my-6 border-t border-[var(--line)]" />

      <section>
        <h2 className="mb-2 font-medium">体重</h2>
        {weightPoints.some((point) => point.value != null) ? (
          <TrendChart
            points={weightPoints}
            fillEmptyWithZero={false}
            formatY={(value) => formatWeight(value, unit).split(" ")[0]}
          />
        ) : (
          <p className="py-8 text-center text-sm text-[var(--muted)]">暂无体重记录</p>
        )}
      </section>

      <section className="mt-6 border-t border-[var(--line)] pt-6">
        <h2 className="mb-4 text-center font-medium">{formatMonthTitle(today)}</h2>
        <div className="grid grid-cols-7 text-center text-xs text-[var(--muted)]">
          {["日", "一", "二", "三", "四", "五", "六"].map((label) => (
            <div key={label} className="py-1">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 text-center text-sm">
          {cells.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="h-10" />;
            const day = Number(date.slice(8, 10));
            const isToday = date === today;
            const marked = markedDates.has(date);
            return (
              <Link
                key={date}
                href={`/history/${date}`}
                className="flex h-10 flex-col items-center justify-center"
              >
                <span
                  className={
                    isToday
                      ? "flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-white"
                      : undefined
                  }
                >
                  {day}
                </span>
                {marked ? (
                  <span className="mt-0.5 h-1 w-1 rounded-full bg-[var(--accent)]" />
                ) : (
                  <span className="mt-0.5 h-1 w-1" />
                )}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6 border-t border-[var(--line)] pt-6">
        <h2 className="mb-4 font-medium">最近记录</h2>
        {recentDates.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">暂无饮食记录</p>
        ) : (
          <div className="space-y-4">
            {recentDates.map((date) => {
              const summary = summarizeDay(
                date,
                mealMap.get(date) ?? [],
                weightMap.get(date),
              );
              return (
                <Link key={date} href={`/history/${date}`} className="block">
                  <div className="flex items-start justify-between">
                    <span>{formatListDate(date)}</span>
                    <span className="text-sm">{summary.calories} kcal</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm text-[var(--muted)]">
                    <span>
                      {summary.mealTypes
                        .map((type) => mealTypeLabel(type))
                        .join(" · ") || "未记录餐别"}
                    </span>
                    <span>&gt;</span>
                  </div>
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
          ? "rounded-full bg-[var(--accent)] px-4 py-1.5 text-sm text-white"
          : "rounded-full border border-[var(--line)] px-4 py-1.5 text-sm text-[var(--muted)]"
      }
    >
      {children}
    </button>
  );
}
