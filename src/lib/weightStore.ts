import { db } from "@/lib/db";
import type { WeightEntry } from "@/lib/types";

export async function saveWeight(date: string, weightKg: number): Promise<void> {
  const entry: WeightEntry = { date, weightKg };
  await db.weights.put(entry);
}

export async function getWeight(date: string): Promise<WeightEntry | undefined> {
  return db.weights.get(date);
}
