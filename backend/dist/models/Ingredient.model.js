import { Schema, model } from "mongoose";
const IngredientSchema = new Schema({
    ingr_name: { type: String, required: true, index: true },
    ingr_id: { type: String, required: true, unique: true, index: true },
    cal: { type: Number, required: true },
    fat: { type: Number, required: true },
    carb: { type: Number, required: true },
    protein: { type: Number, required: true },
}, {
    collection: "ingredients",
    timestamps: false,
});
export const IngredientModel = model("Ingredient", IngredientSchema);
