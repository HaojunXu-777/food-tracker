import type { FoodItem, MealEntry, MealType } from "@/lib/types";

export const MEAL_TYPES: { type: MealType; label: string }[] = [
  { type: "breakfast", label: "早餐" },
  { type: "lunch", label: "午餐" },
  { type: "dinner", label: "晚餐" },
  { type: "snack", label: "加餐" },
];

export const FOOD_UNITS: { value: FoodItem["unit"]; label: string }[] = [
  { value: "g", label: "g" },
  { value: "ml", label: "ml" },
  { value: "piece", label: "个" },
  { value: "slice", label: "片" },
  { value: "bowl", label: "碗" },
  { value: "serving", label: "份" },
];

export function isMealType(value: string): value is MealType {
  return MEAL_TYPES.some((item) => item.type === value);
}

export function mealTypeLabel(type: MealType): string {
  return MEAL_TYPES.find((item) => item.type === type)?.label ?? type;
}

export type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function emptyTotals(): NutritionTotals {
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
}

export function sumFoods(foods: FoodItem[]): NutritionTotals {
  return foods.reduce(
    (acc, food) => ({
      calories: acc.calories + (food.calories ?? 0),
      protein: acc.protein + (food.protein ?? 0),
      carbs: acc.carbs + (food.carbs ?? 0),
      fat: acc.fat + (food.fat ?? 0),
    }),
    emptyTotals(),
  );
}

export function sumMeals(meals: MealEntry[]): NutritionTotals {
  return meals.reduce((acc, meal) => {
    const t = sumFoods(meal.foods);
    return {
      calories: acc.calories + t.calories,
      protein: acc.protein + t.protein,
      carbs: acc.carbs + t.carbs,
      fat: acc.fat + t.fat,
    };
  }, emptyTotals());
}

export function roundNutrition(n: number): number {
  return Math.round(n);
}
