import type { FoodUnit } from "@/lib/types";

/** Simple per-unit defaults. User can always edit. */
const DEFAULT_UNIT_WEIGHT: Record<Exclude<FoodUnit, "g">, number> = {
  ml: 1,
  piece: 50,
  slice: 30,
  bowl: 200,
  serving: 100,
};

export function needsUnitWeight(unit: FoodUnit): boolean {
  return unit !== "g";
}

export function unitWeightLabel(unit: FoodUnit): string | null {
  switch (unit) {
    case "piece":
      return "每个约";
    case "slice":
      return "每片约";
    case "bowl":
      return "每碗约";
    case "serving":
      return "每份约";
    case "ml":
      return "每 ml 约";
    default:
      return null;
  }
}

export function defaultUnitWeightGrams(
  unit: FoodUnit,
  usdaServingGrams?: number | null,
): number | null {
  if (unit === "g") return null;
  if (usdaServingGrams != null && usdaServingGrams > 0) {
    return usdaServingGrams;
  }
  return DEFAULT_UNIT_WEIGHT[unit];
}

/** Round for display / storage: keep at most 1 decimal. */
export function roundWeightGrams(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * weightGrams from amount + unit (+ optional per-unit grams).
 * - g: amount
 * - ml / 个 / 片 / 碗 / 份: amount × unitWeightGrams
 */
export function computeWeightGrams(
  amount: number | null,
  unit: FoodUnit,
  unitWeightGrams: number | null,
): number | null {
  if (amount == null || !Number.isFinite(amount)) return null;
  if (unit === "g") return roundWeightGrams(amount);
  if (unitWeightGrams == null || !Number.isFinite(unitWeightGrams)) return null;
  return roundWeightGrams(amount * unitWeightGrams);
}

/** Infer unitWeightGrams from saved amount/weight when field is missing (legacy rows). */
export function inferUnitWeightGrams(
  amount: number | null,
  unit: FoodUnit,
  weightGrams: number | null,
  stored?: number | null,
): number | null {
  if (unit === "g") return null;
  if (stored != null && Number.isFinite(stored) && stored > 0) return stored;
  if (
    amount != null &&
    amount !== 0 &&
    weightGrams != null &&
    Number.isFinite(amount) &&
    Number.isFinite(weightGrams)
  ) {
    return roundWeightGrams(weightGrams / amount);
  }
  return defaultUnitWeightGrams(unit);
}
