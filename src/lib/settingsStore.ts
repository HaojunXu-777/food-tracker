import { db } from "@/lib/db";
import type { Goals, GoalsRecord, Settings, SettingsRecord, WeightUnit } from "@/lib/types";

export async function saveGoals(goals: Goals): Promise<void> {
  const record: GoalsRecord = { id: "default" };
  if (goals.calories != null) record.calories = goals.calories;
  if (goals.protein != null) record.protein = goals.protein;
  if (goals.carbs != null) record.carbs = goals.carbs;
  if (goals.fat != null) record.fat = goals.fat;
  await db.goals.put(record);
}

export async function saveWeightUnit(weightUnit: WeightUnit): Promise<void> {
  const current = (await db.settings.get("default")) ?? { id: "default" as const, weightUnit: "kg" as const };
  const record: SettingsRecord = { ...current, id: "default", weightUnit };
  await db.settings.put(record);
}

export async function getSettings(): Promise<Settings> {
  const record = await db.settings.get("default");
  return { weightUnit: record?.weightUnit ?? "kg" };
}
