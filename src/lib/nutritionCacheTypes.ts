export type NutritionCacheEntry = {
  id: string;
  query: string;
  name: string;
  usdaFdcId: number | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  /** Optional; absent on older cache rows. */
  servingGrams?: number | null;
  queriedAt: number;
};
