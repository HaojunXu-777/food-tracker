import Dexie, { type Table } from "dexie";
import type { NutritionCacheEntry } from "@/lib/nutritionCacheTypes";
import type { PhotoRecord } from "@/lib/photoTypes";
import type {
  GoalsRecord,
  MealEntry,
  SettingsRecord,
  WeightEntry,
} from "@/lib/types";

export class FoodTrackerDB extends Dexie {
  meals!: Table<MealEntry, string>;
  weights!: Table<WeightEntry, string>;
  goals!: Table<GoalsRecord, string>;
  settings!: Table<SettingsRecord, string>;
  nutritionCache!: Table<NutritionCacheEntry, string>;
  photos!: Table<PhotoRecord, string>;

  constructor() {
    super("food-tracker");
    this.version(1).stores({
      meals: "id, date, mealType, [date+mealType]",
      weights: "date",
      goals: "id",
      settings: "id",
    });
    this.version(2).stores({
      meals: "id, date, mealType, [date+mealType]",
      weights: "date",
      goals: "id",
      settings: "id",
      nutritionCache: "id, query, name, usdaFdcId",
    });
    this.version(3).stores({
      meals: "id, date, mealType, [date+mealType]",
      weights: "date",
      goals: "id",
      settings: "id",
      nutritionCache: "id, query, name, usdaFdcId",
      photos: "id, mealId",
    });
  }
}

export const db = new FoodTrackerDB();

if (typeof window !== "undefined") {
  db.on("ready", async () => {
    const settings = await db.settings.get("default");
    if (!settings) {
      await db.settings.put({ id: "default", weightUnit: "kg" });
    }
    const goals = await db.goals.get("default");
    if (!goals) {
      await db.goals.put({ id: "default" });
    }
  });
}
