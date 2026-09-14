"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import {
  buildMealsCsv,
  buildWeightsCsv,
  downloadCsv,
} from "@/lib/csv";
import { todayDate } from "@/lib/date";
import { saveGoals, saveWeightUnit } from "@/lib/settingsStore";
import type { WeightUnit } from "@/lib/types";

function optionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

function goalToInput(value: number | undefined): string {
  return value == null ? "" : String(value);
}

type GoalDraft = {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

export default function SettingsPage() {
  const goals = useLiveQuery(() => db.goals.get("default"), [], undefined);
  const settings = useLiveQuery(() => db.settings.get("default"), [], undefined);
  const unit = settings?.weightUnit ?? "kg";

  const [draft, setDraft] = useState<GoalDraft>({
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const [loaded, setLoaded] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  useEffect(() => {
    if (loaded) return;
    if (goals === undefined) return;
    const next = {
      calories: goalToInput(goals.calories),
      protein: goalToInput(goals.protein),
      carbs: goalToInput(goals.carbs),
      fat: goalToInput(goals.fat),
    };
    draftRef.current = next;
    setDraft(next);
    setLoaded(true);
  }, [goals, loaded]);

  async function persist(next: GoalDraft) {
    draftRef.current = next;
    setDraft(next);
    await saveGoals({
      calories: optionalNumber(next.calories),
      protein: optionalNumber(next.protein),
      carbs: optionalNumber(next.carbs),
      fat: optionalNumber(next.fat),
    });
  }

  function updateField(key: keyof GoalDraft, value: string) {
    void persist({ ...draftRef.current, [key]: value });
  }

  async function exportMeals() {
    setExportMessage("");
    try {
      const meals = await db.meals.toArray();
      if (meals.length === 0) {
        setExportMessage("暂无饮食记录可导出");
        return;
      }
      downloadCsv(`饮食记录-${todayDate()}.csv`, buildMealsCsv(meals));
      setExportMessage("饮食记录已开始下载");
    } catch {
      setExportMessage("导出失败，请重试");
    }
  }

  async function exportWeights() {
    setExportMessage("");
    try {
      const weights = await db.weights.toArray();
      if (weights.length === 0) {
        setExportMessage("暂无体重记录可导出");
        return;
      }
      downloadCsv(
        `体重记录-${todayDate()}.csv`,
        buildWeightsCsv(weights, unit),
      );
      setExportMessage("体重记录已开始下载");
    } catch {
      setExportMessage("导出失败，请重试");
    }
  }

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="text-center text-xl font-semibold">设置</h1>

      <section className="mt-8">
        <h2 className="mb-4 font-medium">每日目标</h2>
        <div className="space-y-3">
          <GoalField
            label="卡路里"
            unit="kcal"
            value={draft.calories}
            onChange={(value) => updateField("calories", value)}
          />
          <GoalField
            label="蛋白质"
            unit="g"
            value={draft.protein}
            onChange={(value) => updateField("protein", value)}
          />
          <GoalField
            label="碳水"
            unit="g"
            value={draft.carbs}
            onChange={(value) => updateField("carbs", value)}
          />
          <GoalField
            label="脂肪"
            unit="g"
            value={draft.fat}
            onChange={(value) => updateField("fat", value)}
          />
        </div>
      </section>

      <section className="mt-8 border-t border-[var(--line)] pt-6">
        <h2 className="mb-4 font-medium">体重</h2>
        <div className="flex items-center justify-between">
          <span>单位</span>
          <div className="flex gap-2">
            <UnitButton
              label="kg"
              active={unit === "kg"}
              onClick={() => saveWeightUnit("kg")}
            />
            <UnitButton
              label="lb"
              active={unit === "lb"}
              onClick={() => saveWeightUnit("lb")}
            />
          </div>
        </div>
      </section>

      <section className="mt-8 border-t border-[var(--line)] pt-6">
        <h2 className="mb-4 font-medium">数据</h2>
        <div className="space-y-2">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl border border-[var(--line)] px-4 py-3 text-left"
            onClick={() => void exportMeals()}
          >
            <span>导出饮食记录 CSV</span>
            <span className="text-[var(--muted)]">&gt;</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl border border-[var(--line)] px-4 py-3 text-left"
            onClick={() => void exportWeights()}
          >
            <span>导出体重记录 CSV</span>
            <span className="text-[var(--muted)]">&gt;</span>
          </button>
        </div>
        {exportMessage ? (
          <p className="mt-3 text-sm text-[var(--muted)]">{exportMessage}</p>
        ) : null}
      </section>
    </div>
  );
}

function GoalField({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <span className="flex items-center gap-2">
        <input
          className="w-24 rounded-lg border border-[var(--line)] px-3 py-2 text-right"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="w-10 text-[var(--muted)]">{unit}</span>
      </span>
    </label>
  );
}

function UnitButton({
  label,
  active,
  onClick,
}: {
  label: WeightUnit;
  active: boolean;
  onClick: () => void;
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
      {label}
    </button>
  );
}
