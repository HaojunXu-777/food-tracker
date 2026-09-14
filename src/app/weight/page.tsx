"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { db } from "@/lib/db";
import { todayDate } from "@/lib/date";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { parseWeightInput, toDisplayWeight } from "@/lib/weight";
import { saveWeight } from "@/lib/weightStore";

export default function WeightPage() {
  const router = useRouter();
  const date = todayDate();
  const weight = useLiveQuery(() => db.weights.get(date), [date], undefined);
  const settings = useLiveQuery(() => db.settings.get("default"), [], undefined);
  const unit = settings?.weightUnit ?? "kg";
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (weight) {
      setValue(toDisplayWeight(weight.weightKg, unit).toFixed(1));
    } else if (hydrated) {
      setValue("");
    }
    setHydrated(true);
  }, [weight, unit, hydrated]);

  async function handleSave() {
    const weightKg = parseWeightInput(value, unit);
    if (weightKg == null) {
      setError("请输入有效体重");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveWeight(date, weightKg);
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("保存失败，请重试");
      setSaving(false);
    }
  }

  return (
    <div className="px-2">
      <PageHeader title="今日体重" backHref="/" />
      <div className="px-2 pt-6">
        <label className="block text-sm">
          体重（{unit}）
          <input
            className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={unit === "kg" ? "70.4" : "155.2"}
          />
        </label>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button
          type="button"
          disabled={saving}
          className="mt-6 w-full rounded-xl bg-[var(--accent)] py-3 text-white disabled:opacity-60"
          onClick={handleSave}
        >
          {saving ? "保存中…" : "保存"}
        </button>
      </div>
    </div>
  );
}
