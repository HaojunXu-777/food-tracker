import type { MealType } from "@/lib/types";

export type MealAccent = {
  key: MealType;
  color: string;
  soft: string;
};

const MEAL_ACCENTS: Record<MealType, MealAccent> = {
  breakfast: {
    key: "breakfast",
    color: "var(--accent-yellow)",
    soft: "rgba(245, 192, 66, 0.16)",
  },
  lunch: {
    key: "lunch",
    color: "var(--accent-cyan)",
    soft: "rgba(46, 196, 182, 0.14)",
  },
  dinner: {
    key: "dinner",
    color: "var(--accent-violet)",
    soft: "rgba(139, 124, 246, 0.14)",
  },
  snack: {
    key: "snack",
    color: "var(--accent-pink)",
    soft: "rgba(240, 115, 168, 0.14)",
  },
};

export function mealAccent(type: MealType): MealAccent {
  return MEAL_ACCENTS[type];
}
