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
    <div className="ft-page px-4 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <h1 className="text-center text-xl font-bold tracking-tight">设置</h1>

      <section className="ft-card mt-6 p-4">
        <h2 className="font-semibold">每日目标</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          可留空；首页圆环与进度条会据此显示
        </p>
        <div className="mt-4 space-y-3">
          <GoalField
            label="卡路里"
            unit="kcal"
            accent="var(--accent-cyan)"
            value={draft.calories}
            onChange={(value) => updateField("calories", value)}
          />
          <GoalField
            label="蛋白质"
            unit="g"
            accent="var(--protein)"
            value={draft.protein}
            onChange={(value) => updateField("protein", value)}
          />
          <GoalField
            label="碳水"
            unit="g"
            accent="var(--carbs)"
            value={draft.carbs}
            onChange={(value) => updateField("carbs", value)}
          />
          <GoalField
            label="脂肪"
            unit="g"
            accent="var(--fat)"
            value={draft.fat}
            onChange={(value) => updateField("fat", value)}
          />
        </div>
      </section>

      <section className="ft-card mt-4 p-4">
        <h2 className="font-semibold">体重单位</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">内部统一按 kg 存储</p>
        <div className="mt-4 flex rounded-full bg-[var(--input-bg)] p-1">
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
      </section>

      <section className="ft-card mt-4 p-4">
        <h2 className="font-semibold">数据导出</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          在浏览器本地下载 CSV，不会上传
        </p>
        <div className="mt-4 space-y-2.5">
          <button
            type="button"
            className="ft-btn-secondary"
            onClick={() => void exportMeals()}
          >
            导出饮食记录 CSV
          </button>
          <button
            type="button"
            className="w-full rounded-[1rem] bg-[rgba(240,115,168,0.12)] py-3.5 font-semibold text-[var(--accent-pink)]"
            onClick={() => void exportWeights()}
          >
            导出体重记录 CSV
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
  accent,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  accent: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 font-medium">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: accent }}
          aria-hidden
        />
        {label}
      </span>
      <span className="flex items-center gap-2">
        <input
          className="ft-input w-24 text-right font-semibold"
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
          ? "flex-1 rounded-full bg-[var(--accent-violet)] py-2.5 text-sm font-semibold text-white"
          : "flex-1 rounded-full py-2.5 text-sm font-medium text-[var(--muted)]"
      }
    >
      {label}
    </button>
  );
}
