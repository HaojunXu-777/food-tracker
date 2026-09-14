import { mealTypeLabel, FOOD_UNITS } from "@/lib/meals";
import { toDisplayWeight } from "@/lib/weight";
import type { MealEntry, WeightEntry, WeightUnit } from "@/lib/types";

function unitLabel(unit: string): string {
  return FOOD_UNITS.find((item) => item.value === unit)?.label ?? unit;
}

function escapeCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
}

export function buildMealsCsv(meals: MealEntry[]): string {
  const header = [
    "日期",
    "餐别",
    "食物名称",
    "数量",
    "单位",
    "克数",
    "kcal",
    "蛋白质",
    "碳水",
    "脂肪",
    "备注",
  ];
  const rows: (string | number | null | undefined)[][] = [header];
  const sorted = [...meals].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return b.createdAt - a.createdAt;
  });

  for (const meal of sorted) {
    if (meal.foods.length === 0) {
      rows.push([
        meal.date,
        mealTypeLabel(meal.mealType),
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        meal.note ?? "",
      ]);
      continue;
    }
    meal.foods.forEach((food, index) => {
      rows.push([
        meal.date,
        mealTypeLabel(meal.mealType),
        food.nameZh,
        food.amount,
        unitLabel(food.unit),
        food.weightGrams,
        food.calories,
        food.protein,
        food.carbs,
        food.fat,
        index === 0 ? (meal.note ?? "") : "",
      ]);
    });
  }

  return toCsv(rows);
}

export function buildWeightsCsv(
  weights: WeightEntry[],
  unit: WeightUnit,
): string {
  const header = ["日期", "体重", "单位"];
  const rows: (string | number | null | undefined)[][] = [header];
  const sorted = [...weights].sort((a, b) => (a.date < b.date ? 1 : -1));
  for (const entry of sorted) {
    rows.push([
      entry.date,
      toDisplayWeight(entry.weightKg, unit).toFixed(1),
      unit,
    ]);
  }
  return toCsv(rows);
}

export function downloadCsv(filename: string, csvBody: string): void {
  // UTF-8 BOM so Excel opens Chinese correctly
  const blob = new Blob(["\uFEFF" + csvBody], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
