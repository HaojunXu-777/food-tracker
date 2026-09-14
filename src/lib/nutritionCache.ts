import { db } from "@/lib/db";
import type { NutritionSearchItem } from "@/lib/nutrition";
import { normalizeQuery } from "@/lib/nutrition";
import type { NutritionCacheEntry } from "@/lib/nutritionCacheTypes";

export async function getCachedByQuery(query: string): Promise<NutritionSearchItem[]> {
  const key = normalizeQuery(query);
  if (!key) return [];
  const rows = await db.nutritionCache.where("query").equals(key).toArray();
  return rows.map(toSearchItem);
}

export async function saveSearchCache(
  query: string,
  items: NutritionSearchItem[],
): Promise<void> {
  const key = normalizeQuery(query);
  if (!key || items.length === 0) return;
  const existing = await db.nutritionCache.where("query").equals(key).toArray();
  await db.transaction("rw", db.nutritionCache, async () => {
    await db.nutritionCache.bulkDelete(existing.map((row) => row.id));
    await db.nutritionCache.bulkAdd(items.map((item) => toCacheEntry(key, item)));
  });
}

export async function saveSelectedCache(
  query: string,
  item: NutritionSearchItem,
): Promise<void> {
  const key = normalizeQuery(query);
  if (!key) return;
  await db.nutritionCache.put(toCacheEntry(key, item));
}

function toSearchItem(row: NutritionCacheEntry): NutritionSearchItem {
  return {
    fdcId: row.usdaFdcId,
    nameZh: row.name,
    nameEn: row.name,
    caloriesPer100g: row.caloriesPer100g,
    proteinPer100g: row.proteinPer100g,
    carbsPer100g: row.carbsPer100g,
    fatPer100g: row.fatPer100g,
  };
}

function toCacheEntry(query: string, item: NutritionSearchItem): NutritionCacheEntry {
  return {
    id: item.fdcId != null ? `${query}:${item.fdcId}` : `${query}:${item.nameZh}`,
    query,
    name: item.nameZh,
    usdaFdcId: item.fdcId,
    caloriesPer100g: item.caloriesPer100g,
    proteinPer100g: item.proteinPer100g,
    carbsPer100g: item.carbsPer100g,
    fatPer100g: item.fatPer100g,
    queriedAt: Date.now(),
  };
}
