import { roundNutrition, sumMeals } from "@/lib/meals";
import type { MealEntry, MealType, WeightEntry } from "@/lib/types";

export type DaySummary = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealTypes: MealType[];
  weightKg?: number;
};

export function mealsByDate(meals: MealEntry[]): Map<string, MealEntry[]> {
  const map = new Map<string, MealEntry[]>();
  for (const meal of meals) {
    const list = map.get(meal.date) ?? [];
    list.push(meal);
    map.set(meal.date, list);
  }
  return map;
}

export function weightsByDate(weights: WeightEntry[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const entry of weights) {
    map.set(entry.date, entry.weightKg);
  }
  return map;
}

export function summarizeDay(
  date: string,
  meals: MealEntry[],
  weightKg?: number,
): DaySummary {
  const totals = sumMeals(meals);
  const mealTypes = (["breakfast", "lunch", "dinner", "snack"] as const).filter(
    (type) => meals.some((meal) => meal.mealType === type),
  );
  return {
    date,
    calories: roundNutrition(totals.calories),
    protein: roundNutrition(totals.protein),
    carbs: roundNutrition(totals.carbs),
    fat: roundNutrition(totals.fat),
    mealTypes,
    weightKg,
  };
}
