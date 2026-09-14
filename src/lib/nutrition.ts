export type NutritionSearchItem = {
  fdcId: number | null;
  nameZh: string;
  nameEn: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
};

export function nutritionFromGrams(per100g: number, weightGrams: number): number {
  return Math.round((per100g * weightGrams) / 100);
}

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}
