import type { IFood } from "@types";
import { Schema, model } from "mongoose";

const foodSchema = new Schema<IFood>({
  ingr_name: { type: String, required: true, index: true },
  ingr_id: { type: String, required: true, unique: true, index: true },
  cal: { type: Number, required: true },
  fat: { type: Number, required: true },
  carb: { type: Number, required: true },
  protein: { type: Number, required: true },
});

export const foodModel = model<IFood>("foods", foodSchema);
