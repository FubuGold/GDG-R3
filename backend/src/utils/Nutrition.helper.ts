import { foodModel } from "@/models/Food.model";
import { RETURN_SIZE, SAMPLE_SIZE, THRESHOLD, TOP_SIZE } from "@config/app";
import type { Ingredient, Nutrient, Recommend, User } from "@types";

/**
 * 1g carb = 4 kcal
 * 1g protein = 4 kcal
 * 1g fat = 9 kcal
 */
const CALORIES_PER_GRAM = { protein: 4, carb: 4, fat: 9 } as const;

const ACTIVITY_LEVEL: Record<User["activity_level"], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const MACRO: Record<
  string,
  {
    protein: number;
    carb: number;
    fat: number;
  }
> = {
  balanced: { protein: 0.3, carb: 0.4, fat: 0.3 },
  lose_weight: { protein: 0.4, carb: 0.35, fat: 0.25 },
  gain_weight: { protein: 0.3, carb: 0.4, fat: 0.3 },
  maintain_weight: { protein: 0.3, carb: 0.4, fat: 0.3 },
};

export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: string
): number {
  const isMale = gender.toLowerCase() === "male";
  const bmr = 10 * weight + 6.25 * height - 5 * age + (isMale ? 5 : -161);
  return bmr;
}

export function calculateTDEE(
  bmr: number,
  activityLevel: User["activity_level"]
): number {
  const multiplier = ACTIVITY_LEVEL[activityLevel];
  return bmr * multiplier;
}

export function calculateTargetCalories(
  tdee: number,
  goal: User["goal"]
): number {
  switch (goal) {
    case "lose_weight":
      const deficit = Math.max(tdee * 0.15, 500);
      return Math.max(tdee - deficit, 1200);
    case "gain_weight":
      return tdee + 250;
    case "maintain_weight":
    default:
      return tdee;
  }
}
export function calculateProteinRequirement(
  weight: number,
  goal: User["goal"]
): number {
  switch (goal) {
    case "lose_weight":
    case "gain_weight":
      return weight * 1.9;
    case "maintain_weight":
    default:
      return weight * 1.0;
  }
}

export function calculateMacro(
  targetCalories: number,
  weight: number,
  goal: User["goal"]
): { protein: number; carb: number; fat: number } {
  const proteinGrams = Math.max(0, calculateProteinRequirement(weight, goal));
  const proteinCalories = proteinGrams * CALORIES_PER_GRAM.protein;

  const remainingCalories = Math.max(0, targetCalories - proteinCalories);

  const macro = MACRO[goal] || MACRO.balanced;

  const carbFatRatio = macro.carb + macro.fat;
  const safeRatio = carbFatRatio > 0 ? carbFatRatio : 1;

  const carbCalories = remainingCalories * (macro.carb / safeRatio);
  const fatCalories = remainingCalories * (macro.fat / safeRatio);

  return {
    protein: Math.round(proteinGrams),
    carb: Math.max(0, Math.round(carbCalories / CALORIES_PER_GRAM.carb)),
    fat: Math.max(0, Math.round(fatCalories / CALORIES_PER_GRAM.fat)),
  };
}

function compare(
  a: Ingredient,
  b: Ingredient,
  key: keyof Ingredient,
  inverted: boolean = false
) {
  if (a[key] < b[key]) {
    return inverted ? -1 : 1;
  }
  if (a[key] > b[key]) return inverted ? 1 : -1;
  return 0;
}

function getRecommend(
  data: Ingredient[],
  key: keyof Ingredient,
  inverted: boolean = false
) {
  const sorted = [...data].sort((a: Ingredient, b: Ingredient) =>
    compare(a, b, key, inverted)
  );
  let top = sorted.slice(0, TOP_SIZE);
  top.sort(() => Math.random() - 0.5);
  return top.slice(0, RETURN_SIZE);
}

export async function queryRecommend(diffNutrient: Nutrient, foodId?: string) {
  const match: Record<string, any> = {
    $or: [
      { cal: { $ne: 0 } },
      { fat: { $ne: 0 } },
      { carb: { $ne: 0 } },
      { protein: { $ne: 0 } },
    ],
  };

  if (foodId) {
    match._id = { $ne: foodId };
  }

  const random_selected = await foodModel.aggregate<Ingredient>([
    { $match: match },
    { $sample: { size: SAMPLE_SIZE } },
  ]);

  const result: Recommend = {};
  const nutrientKeys: (keyof Nutrient)[] = ["cal", "protein", "carb", "fat"];

  for (const key of nutrientKeys) {
    const value = diffNutrient[key];
    if (value > THRESHOLD) {
      result[key] = getRecommend(random_selected, key);
    } else if (value < -THRESHOLD) {
      result[key] = getRecommend(random_selected, key, true);
      const lessKey = ("less_" + String(key)) as keyof Recommend;
      result[lessKey] = getRecommend(random_selected, key);
    }
  }

  return result;
}

export async function analyzeNutrition(dish_name: string, user: User) {
  const food = await foodModel.findOne({
    ingr_name: { $regex: dish_name, $options: "i" },
  });

  if (!food) {
    return null;
  }

  const bmr = calculateBMR(user.weight, user.height, user.age, user.gender);
  const tdee = calculateTDEE(bmr, user.activity_level);
  const targetCalories = calculateTargetCalories(tdee, user.goal);
  const macro = calculateMacro(targetCalories, user.weight, user.goal);

  const targetNutrient: Nutrient = {
    cal: Math.round(targetCalories),
    protein: macro.protein,
    carb: macro.carb,
    fat: macro.fat,
  };

  const foodNutrition: Nutrient = {
    cal: food.cal,
    protein: food.protein,
    carb: food.carb,
    fat: food.fat,
  };

  const diffNutrient = calculateNutrientDeficiency(
    foodNutrition,
    targetNutrient
  );

  const recommendations = await queryRecommend(diffNutrient, food.id);

  return {
    food: {
      name: food.ingr_name,
      nutrition: foodNutrition,
    },
    diffNutrient,
    recommendations,
    userProfile: {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
    },
  };
}

export function calculateNutrientDeficiency(
  consumed: Nutrient,
  target: Nutrient
): Nutrient {
  return {
    cal: target.cal - consumed.cal,
    protein: target.protein - consumed.protein,
    carb: target.carb - consumed.carb,
    fat: target.fat - consumed.fat,
  };
}
