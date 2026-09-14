type UsdaNutrient = {
  nutrientId?: number;
  nutrientNumber?: string | number;
  nutrientName?: string;
  unitName?: string;
  value?: number;
};

type UsdaFoodPortion = {
  gramWeight?: number;
  amount?: number;
};

type UsdaFood = {
  fdcId?: number;
  description?: string;
  foodNutrients?: UsdaNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
  foodPortions?: UsdaFoodPortion[];
};

/** Only accept clear gram-based serving sizes; never invent values. */
function extractServingGrams(food: UsdaFood): number | null {
  const portions = food.foodPortions ?? [];
  const single = portions.find(
    (p) =>
      p.amount === 1 &&
      typeof p.gramWeight === "number" &&
      Number.isFinite(p.gramWeight) &&
      p.gramWeight >= 1 &&
      p.gramWeight <= 1000,
  );
  if (single?.gramWeight != null) {
    return Math.round(single.gramWeight);
  }
  const first = portions.find(
    (p) =>
      typeof p.gramWeight === "number" &&
      Number.isFinite(p.gramWeight) &&
      p.gramWeight >= 1 &&
      p.gramWeight <= 1000,
  );
  if (first?.gramWeight != null) {
    return Math.round(first.gramWeight);
  }

  const size = food.servingSize;
  const unit = (food.servingSizeUnit ?? "").toLowerCase();
  const isGram =
    unit === "g" || unit === "grm" || unit === "gram" || unit === "grams";
  if (
    isGram &&
    typeof size === "number" &&
    Number.isFinite(size) &&
    size >= 1 &&
    size <= 1000
  ) {
    return Math.round(size);
  }
  return null;
}

const ENERGY_IDS = new Set([1008, 2047, 2048, 208]);
const PROTEIN_IDS = new Set([1003, 203]);
const CARB_IDS = new Set([1005, 205]);
const FAT_IDS = new Set([1004, 204]);

function pickNutrient(
  nutrients: UsdaNutrient[],
  ids: Set<number>,
  options?: { unit?: string; names?: string[] },
): number | null {
  const match = nutrients.find((item) => {
    const id = item.nutrientId;
    const number = Number(item.nutrientNumber);
    const idOk = (id != null && ids.has(id)) || ids.has(number);
    const name = (item.nutrientName ?? "").toLowerCase();
    const nameOk = options?.names?.some((n) => name === n.toLowerCase()) ?? false;
    if (!idOk && !nameOk) return false;
    if (options?.unit && item.unitName && item.unitName.toUpperCase() !== options.unit) {
      return false;
    }
    return typeof item.value === "number" && Number.isFinite(item.value);
  });
  return match?.value ?? null;
}

export function parseUsdaFood(food: UsdaFood): {
  fdcId: number | null;
  nameEn: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  servingGrams: number | null;
} | null {
  const nutrients = food.foodNutrients ?? [];
  const calories =
    pickNutrient(nutrients, ENERGY_IDS, { unit: "KCAL", names: ["Energy"] }) ??
    pickNutrient(nutrients, ENERGY_IDS, { unit: "KCAL" });
  const protein = pickNutrient(nutrients, PROTEIN_IDS, { names: ["Protein"] });
  const carbs = pickNutrient(nutrients, CARB_IDS, {
    names: ["Carbohydrate, by difference"],
  });
  const fat = pickNutrient(nutrients, FAT_IDS, { names: ["Total lipid (fat)"] });
  if (calories == null && protein == null && carbs == null && fat == null) {
    return null;
  }
  return {
    fdcId: food.fdcId ?? null,
    nameEn: food.description ?? "",
    caloriesPer100g: Math.round(calories ?? 0),
    proteinPer100g: Math.round(protein ?? 0),
    carbsPer100g: Math.round(carbs ?? 0),
    fatPer100g: Math.round(fat ?? 0),
    servingGrams: extractServingGrams(food),
  };
}
