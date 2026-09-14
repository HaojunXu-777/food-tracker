import { db } from "@/lib/db";
import type { MealEntry, MealType } from "@/lib/types";

export async function addMeal(entry: MealEntry): Promise<string> {
  await db.meals.add(entry);
  return entry.id;
}

export async function getMeal(id: string): Promise<MealEntry | undefined> {
  return db.meals.get(id);
}

export async function getMealsByDate(date: string): Promise<MealEntry[]> {
  return db.meals.where("date").equals(date).sortBy("createdAt");
}

export async function getMealsByDateAndType(
  date: string,
  mealType: MealType,
): Promise<MealEntry[]> {
  return db.meals
    .where("[date+mealType]")
    .equals([date, mealType])
    .sortBy("createdAt");
}

export async function updateMeal(
  id: string,
  patch: Partial<Omit<MealEntry, "id" | "createdAt">>,
): Promise<void> {
  await db.meals.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteMeal(id: string): Promise<void> {
  await db.transaction("rw", db.meals, db.photos, async () => {
    await db.photos.where("mealId").equals(id).delete();
    await db.meals.delete(id);
  });
}
