"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PhotoEditor } from "@/components/diet/PhotoEditor";
import { addMeal, getMeal, updateMeal } from "@/lib/mealStore";
import { todayDate } from "@/lib/date";
import { blobToDataUrl } from "@/lib/image/compress";
import { FOOD_UNITS, roundNutrition, sumFoods } from "@/lib/meals";
import { nutritionFromGrams } from "@/lib/nutrition";
import type { NutritionSearchItem } from "@/lib/nutrition";
import {
  getCachedByQuery,
  saveSearchCache,
  saveSelectedCache,
} from "@/lib/nutritionCache";
import { getPhotosByMealId, reassignPhotos } from "@/lib/photoStore";
import type { FoodItem, FoodUnit, MealEntry, MealType, NutritionSource } from "@/lib/types";

type AiFoodSeed = {
  nameZh: string;
  usda: NutritionSearchItem | null;
};

type ManualMealFormProps = {
  mealType: MealType;
  mealId?: string;
  initialMeal?: MealEntry;
  photoMealKey?: string;
  enableEstimateWeight?: boolean;
  aiFoods?: AiFoodSeed[];
};

type FoodDraft = {
  key: string;
  nameZh: string;
  amount: string;
  unit: FoodUnit;
  weightGrams: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  nutritionSource: NutritionSource;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
};

function emptyFood(): FoodDraft {
  return {
    key: crypto.randomUUID(),
    nameZh: "",
    amount: "",
    unit: "g",
    weightGrams: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    nutritionSource: "manual",
    caloriesPer100g: null,
    proteinPer100g: null,
    carbsPer100g: null,
    fatPer100g: null,
  };
}

function fromFoodItem(food: FoodItem): FoodDraft {
  return {
    key: food.id,
    nameZh: food.nameZh,
    amount: food.amount == null ? "" : String(food.amount),
    unit: food.unit,
    weightGrams: food.weightGrams == null ? "" : String(food.weightGrams),
    calories: food.calories == null ? "" : String(food.calories),
    protein: food.protein == null ? "" : String(food.protein),
    carbs: food.carbs == null ? "" : String(food.carbs),
    fat: food.fat == null ? "" : String(food.fat),
    nutritionSource: food.nutritionSource,
    caloriesPer100g: null,
    proteinPer100g: null,
    carbsPer100g: null,
    fatPer100g: null,
  };
}

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function toFoodItem(draft: FoodDraft): FoodItem {
  return {
    id: draft.key,
    nameZh: draft.nameZh.trim(),
    amount: parseNumber(draft.amount),
    unit: draft.unit,
    weightGrams: parseNumber(draft.weightGrams),
    calories: parseNumber(draft.calories),
    protein: parseNumber(draft.protein),
    carbs: parseNumber(draft.carbs),
    fat: parseNumber(draft.fat),
    nutritionSource: draft.nutritionSource,
  };
}

function fromSearchItem(item: NutritionSearchItem): FoodDraft {
  return {
    key: crypto.randomUUID(),
    nameZh: item.nameZh,
    amount: "100",
    unit: "g",
    weightGrams: "100",
    calories: String(item.caloriesPer100g),
    protein: String(item.proteinPer100g),
    carbs: String(item.carbsPer100g),
    fat: String(item.fatPer100g),
    nutritionSource: "usda",
    caloriesPer100g: item.caloriesPer100g,
    proteinPer100g: item.proteinPer100g,
    carbsPer100g: item.carbsPer100g,
    fatPer100g: item.fatPer100g,
  };
}

function fromAiFood(seed: AiFoodSeed): FoodDraft {
  if (seed.usda) {
    return {
      ...fromSearchItem(seed.usda),
      nameZh: seed.nameZh,
      amount: "",
      weightGrams: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    };
  }
  return {
    ...emptyFood(),
    nameZh: seed.nameZh,
  };
}

export function ManualMealForm({
  mealType,
  mealId,
  initialMeal,
  photoMealKey,
  enableEstimateWeight = false,
  aiFoods,
}: ManualMealFormProps) {
  const router = useRouter();
  const [foods, setFoods] = useState<FoodDraft[]>(
    aiFoods?.length
      ? aiFoods.map(fromAiFood)
      : initialMeal?.foods.length
        ? initialMeal.foods.map(fromFoodItem)
        : [],
  );
  const [note, setNote] = useState(initialMeal?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState<NutritionSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchEmpty, setSearchEmpty] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [estimatingIndex, setEstimatingIndex] = useState<number | null>(null);
  const [photoKey] = useState(
    () => photoMealKey ?? mealId ?? `draft:${crypto.randomUUID()}`,
  );

  const totals = sumFoods(foods.map(toFoodItem));

  function updateFood(index: number, patch: Partial<FoodDraft>) {
    setFoods((current) =>
      current.map((food, i) => (i === index ? { ...food, ...patch } : food)),
    );
  }

  function applyUsdaWeight(index: number, weightText: string) {
    setFoods((current) =>
      current.map((food, i) => {
        if (i !== index) return food;
        const weight = parseNumber(weightText);
        if (
          food.nutritionSource !== "usda" ||
          food.caloriesPer100g == null ||
          weight == null
        ) {
          return { ...food, weightGrams: weightText };
        }
        return {
          ...food,
          weightGrams: weightText,
          amount: food.unit === "g" ? weightText : food.amount,
          calories: String(nutritionFromGrams(food.caloriesPer100g, weight)),
          protein: String(nutritionFromGrams(food.proteinPer100g ?? 0, weight)),
          carbs: String(nutritionFromGrams(food.carbsPer100g ?? 0, weight)),
          fat: String(nutritionFromGrams(food.fatPer100g ?? 0, weight)),
        };
      }),
    );
  }

  function editNutrition(index: number, patch: Partial<FoodDraft>) {
    updateFood(index, {
      ...patch,
      nutritionSource: "manual",
      caloriesPer100g: null,
      proteinPer100g: null,
      carbsPer100g: null,
      fatPer100g: null,
    });
  }

  async function handleSearch() {
    const q = searchInput.trim();
    if (!q) {
      setSearchError("请输入食物名称");
      setResults([]);
      setSearchEmpty(false);
      return;
    }

    setSearching(true);
    setSearchError("");
    setSearchEmpty(false);
    setFromCache(false);

    try {
      const cached = await getCachedByQuery(q);
      if (cached.length > 0) {
        setResults(cached);
        setFromCache(true);
        setSearching(false);
        return;
      }

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setResults([]);
        setSearchError("当前无网络，且本地没有该食物缓存。可手动填写营养");
        return;
      }

      const response = await fetch(
        `/api/nutrition/search?q=${encodeURIComponent(q)}`,
      );
      const data = (await response.json()) as {
        items?: NutritionSearchItem[];
        error?: string;
      };
      if (!response.ok) {
        setResults([]);
        setSearchError(data.error || "搜索失败，请稍后重试");
        return;
      }
      const items = data.items ?? [];
      setResults(items);
      setSearchEmpty(items.length === 0);
      if (items.length > 0) {
        await saveSearchCache(q, items);
      }
    } catch {
      setResults([]);
      setSearchError("网络不可用。离线时只能使用已缓存的食物，或手动填写营养");
    } finally {
      setSearching(false);
    }
  }

  async function addFromSearch(item: NutritionSearchItem) {
    setFoods((current) => [...current, fromSearchItem(item)]);
    await saveSelectedCache(searchInput, item);
  }

  async function estimateWeight(index: number) {
    const food = foods[index];
    if (!food?.nameZh.trim()) {
      setError("请先填写食物名称");
      return;
    }
    setEstimatingIndex(index);
    setError("");
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("当前无网络，AI 估重需要联网。请手动填写克数");
      setEstimatingIndex(null);
      return;
    }
    try {
      const photos = await getPhotosByMealId(photoKey);
      if (photos.length === 0) {
        setError("没有照片，无法估算重量");
        return;
      }
      const images = await Promise.all(photos.map((photo) => blobToDataUrl(photo.blob)));
      const response = await fetch("/api/estimate-weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameZh: food.nameZh.trim(), images }),
      });
      const data = (await response.json()) as {
        estimatedWeightGrams?: number;
        error?: string;
      };
      if (!response.ok || data.estimatedWeightGrams == null) {
        setError(data.error || "重量估算失败，请手动填写");
        return;
      }
      applyUsdaWeight(index, String(data.estimatedWeightGrams));
    } catch {
      setError(
        typeof navigator !== "undefined" && !navigator.onLine
          ? "当前无网络，AI 估重需要联网。请手动填写克数"
          : "重量估算失败，请手动填写",
      );
    } finally {
      setEstimatingIndex(null);
    }
  }

  async function handleSave() {
    const items = foods.map(toFoodItem).filter((food) => food.nameZh !== "");
    if (items.length === 0) {
      setError("请至少填写一个食物名称");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const now = Date.now();
      const savedId = mealId ?? crypto.randomUUID();
      const photoIds =
        photoKey === savedId
          ? (await getPhotosByMealId(savedId)).map((photo) => photo.id)
          : await reassignPhotos(photoKey, savedId);

      if (mealId) {
        const existing = await getMeal(mealId);
        if (!existing) {
          setError("记录不存在");
          setSaving(false);
          return;
        }
        await updateMeal(mealId, {
          foods: items,
          photos: photoIds,
          note: note.trim() || undefined,
        });
      } else {
        await addMeal({
          id: savedId,
          date: todayDate(),
          mealType,
          photos: photoIds,
          foods: items,
          note: note.trim() || undefined,
          createdAt: now,
          updatedAt: now,
        });
      }
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("保存失败，请重试");
      setSaving(false);
    }
  }

  return (
    <div className="px-4 pb-8 pt-4">
      <div className="mb-6">
        <PhotoEditor mealKey={photoKey} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-[var(--line)] px-3 py-2"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleSearch();
            }
          }}
          placeholder="搜索食物名称"
        />
        <button
          type="button"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white"
          onClick={() => void handleSearch()}
          disabled={searching}
        >
          搜索
        </button>
      </div>

      {searching ? (
        <p className="mt-3 text-sm text-[var(--muted)]">搜索中…</p>
      ) : null}
      {searchError ? <p className="mt-3 text-sm text-red-600">{searchError}</p> : null}
      {searchEmpty ? (
        <p className="mt-3 text-sm text-[var(--muted)]">没有找到匹配的食物</p>
      ) : null}
      {fromCache && results.length > 0 ? (
        <p className="mt-3 text-xs text-[var(--muted)]">来自本地缓存</p>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm">搜索结果</p>
          {results.map((item) => (
            <div
              key={`${item.fdcId ?? item.nameZh}-${item.caloriesPer100g}`}
              className="flex items-center justify-between rounded-xl border border-[var(--line)] px-4 py-3"
            >
              <div>
                <p className="font-medium">{item.nameZh}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {item.caloriesPer100g} kcal / 100g
                </p>
                <p className="text-sm text-[var(--muted)]">
                  蛋白质 {item.proteinPer100g}g  碳水 {item.carbsPer100g}g  脂肪 {item.fatPer100g}g
                </p>
              </div>
              <button
                type="button"
                className="px-2 text-lg"
                onClick={() => void addFromSearch(item)}
                aria-label="添加"
              >
                ＋
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <p className="mt-6 text-sm">已添加</p>
      <div className="mt-3 space-y-4">
        {foods.map((food, index) => (
          <article key={food.key} className="rounded-xl border border-[var(--line)] p-4">
            <label className="block text-sm">
              食物名称
              <input
                className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
                value={food.nameZh}
                onChange={(e) => updateFood(index, { nameZh: e.target.value })}
                placeholder="例如：鸡胸肉"
              />
            </label>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-sm">
                数量
                <input
                  className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
                  inputMode="decimal"
                  value={food.amount}
                  onChange={(e) => updateFood(index, { amount: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                单位
                <select
                  className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
                  value={food.unit}
                  onChange={(e) =>
                    updateFood(index, { unit: e.target.value as FoodUnit })
                  }
                >
                  {FOOD_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-3 block text-sm">
              克数 weightGrams
              <input
                className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
                inputMode="decimal"
                value={food.weightGrams}
                onChange={(e) => applyUsdaWeight(index, e.target.value)}
              />
            </label>
            {enableEstimateWeight ? (
              <button
                type="button"
                className="mt-2 w-full rounded-lg border border-[var(--line)] py-2 text-sm"
                disabled={estimatingIndex === index}
                onClick={() => void estimateWeight(index)}
              >
                {estimatingIndex === index ? "估算中…" : "AI估算重量"}
              </button>
            ) : null}

            <div className="mt-3 grid grid-cols-2 gap-3">
              <NumberField
                label="kcal"
                value={food.calories}
                onChange={(value) => editNutrition(index, { calories: value })}
              />
              <NumberField
                label="蛋白质"
                value={food.protein}
                onChange={(value) => editNutrition(index, { protein: value })}
              />
              <NumberField
                label="碳水"
                value={food.carbs}
                onChange={(value) => editNutrition(index, { carbs: value })}
              />
              <NumberField
                label="脂肪"
                value={food.fat}
                onChange={(value) => editNutrition(index, { fat: value })}
              />
            </div>

            <p className="mt-2 text-xs text-[var(--muted)]">
              来源：{food.nutritionSource === "usda" ? "USDA" : "手动"}
            </p>

            <button
              type="button"
              className="mt-3 text-sm text-red-600"
              onClick={() => setDeleteIndex(index)}
            >
              删除
            </button>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="mt-4 w-full py-3 text-center text-sm"
        onClick={() => setFoods((current) => [...current, emptyFood()])}
      >
        ＋ 添加食物
      </button>

      <div className="mt-6 rounded-xl border border-[var(--line)] p-4">
        <p className="font-medium">本餐合计</p>
        <p className="mt-2">{roundNutrition(totals.calories)} kcal</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          蛋白质 {roundNutrition(totals.protein)}g  碳水 {roundNutrition(totals.carbs)}g  脂肪{" "}
          {roundNutrition(totals.fat)}g
        </p>
      </div>

      <label className="mt-4 block text-sm">
        备注（可选）
        <input
          className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <button
        type="button"
        disabled={saving}
        className="mt-4 w-full rounded-xl bg-[var(--accent)] py-3 text-white disabled:opacity-60"
        onClick={handleSave}
      >
        {saving ? "保存中…" : "保存"}
      </button>

      <ConfirmDialog
        open={deleteIndex != null}
        message="确定删除这条记录吗？"
        onCancel={() => setDeleteIndex(null)}
        onConfirm={() => {
          if (deleteIndex == null) return;
          setFoods((current) => current.filter((_, i) => i !== deleteIndex));
          setDeleteIndex(null);
        }}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input
        className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
