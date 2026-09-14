import type { WeightUnit } from "@/lib/types";

export type { WeightUnit };

const KG_TO_LB = 2.2046226218;

export function kgToLb(kg: number): number {
  return kg * KG_TO_LB;
}

export function lbToKg(lb: number): number {
  return lb / KG_TO_LB;
}

export function toDisplayWeight(weightKg: number, unit: WeightUnit): number {
  const value = unit === "lb" ? kgToLb(weightKg) : weightKg;
  return Number(value.toFixed(1));
}

export function formatWeight(weightKg: number, unit: WeightUnit): string {
  return `${toDisplayWeight(weightKg, unit).toFixed(1)} ${unit}`;
}

export function parseWeightInput(value: string, unit: WeightUnit): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;
  return unit === "lb" ? lbToKg(n) : n;
}
