import { connectMongo } from "./Mongodb.helper";
import { IngredientModel } from "../models/Ingredient.model";
import { NUTRITION_CSV_PATH } from "../config/app.conf";
import * as csvParse from "csv-parse/sync";
import * as fs from "fs";
export async function connectToDatabase() {
    await connectMongo();
}
export async function ensureIngredientsSeeded() {
    await connectMongo();
    const count = await IngredientModel.countDocuments();
    if (count > 0) {
        console.log(`[seed] Ingredients collection already has ${count} docs.`);
        return;
    }
    console.log(`[seed] Seeding ingredients from: ${NUTRITION_CSV_PATH}`);
    const filecontent = fs.readFileSync(NUTRITION_CSV_PATH, { encoding: "utf-8" });
    const parsed = csvParse.parse(filecontent, {
        columns: true,
        skip_empty_lines: true,
    });
    const docs = parsed
        .map((e) => ({
        ingr_name: String(e.ingr_name),
        ingr_id: String(e.ingr_id),
        cal: Number(e.cal),
        fat: Number(e.fat),
        carb: Number(e.carb),
        protein: Number(e.protein),
    }))
        .filter((e) => !(e.cal === 0 && e.carb === 0 && e.fat === 0 && e.protein === 0));
    if (docs.length === 0) {
        console.warn("[seed] No valid ingredient rows parsed from CSV!");
        return;
    }
    await IngredientModel.insertMany(docs, { ordered: false });
    console.log(`[seed] Inserted ${docs.length} ingredient docs`);
}
