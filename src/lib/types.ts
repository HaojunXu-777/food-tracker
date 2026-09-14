export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type FoodUnit = "g" | "ml" | "piece" | "slice" | "bowl" | "serving";

export type NutritionSource = "usda" | "ai" | "manual";

export type FoodItem = {
  id: string;
  nameZh: string;
  amount: number | null;
  unit: FoodUnit;
  /** Grams per unit (个/片/碗/份) or g per ml. Optional for legacy rows. */
  unitWeightGrams?: number | null;
  weightGrams: number | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  nutritionSource: NutritionSource;
};

export type MealEntry = {
  id: string;
  date: string;
  mealType: MealType;
  photos: string[];
  foods: FoodItem[];
  note?: string;
  createdAt: number;
  updatedAt: number;
};

export type WeightEntry = {
  date: string;
  weightKg: number;
};

export type Goals = {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

export type WeightUnit = "kg" | "lb";

export type Settings = {
  weightUnit: WeightUnit;
};

export type GoalsRecord = Goals & { id: "default" };

export type SettingsRecord = Settings & { id: "default" };
