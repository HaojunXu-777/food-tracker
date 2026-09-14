import { getCachedByQuery, saveSearchCache } from "@/lib/nutritionCache";
import type { NutritionSearchItem } from "@/lib/nutrition";

export async function lookupNutrition(nameZh: string): Promise<NutritionSearchItem | null> {
  const name = nameZh.trim();
  if (!name) return null;
  const cached = await getCachedByQuery(name);
  if (cached[0]) return cached[0];
  try {
    const response = await fetch(`/api/nutrition/search?q=${encodeURIComponent(name)}`);
    if (!response.ok) return null;
    const data = (await response.json()) as { items?: NutritionSearchItem[] };
    const items = data.items ?? [];
    if (items.length === 0) return null;
    await saveSearchCache(name, items);
    return items[0];
  } catch {
    return null;
  }
}
