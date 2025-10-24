// Food types
export interface IFood {
  ingr_name: string;
  ingr_id: string;
  cal: number;
  fat: number;
  carb: number;
  protein: number;
}

// Ingredient type
export type Ingredient = {
  ingr_name: string;
  ingr_id: string;
  cal: number;
  fat: number;
  carb: number;
  protein: number;
};

// Nutrient type
export type Nutrient = {
  cal: number;
  carb: number;
  fat: number;
  protein: number;
};

// Recommend type
export type Recommend = {
  cal?: Ingredient[];
  fat?: Ingredient[];
  carb?: Ingredient[];
  protein?: Ingredient[];
  less_cal?: Ingredient[];
  less_fat?: Ingredient[];
  less_carb?: Ingredient[];
  less_protein?: Ingredient[];
};

// User type
export type User = {
  age: number;
  gender: string;
  height: number;
  weight: number;
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose_weight" | "maintain_weight" | "gain_weight";
};
