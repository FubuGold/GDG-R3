import { IngredientModel } from "./models/Ingredient.model";
const SAMPLE_SIZE = 300;
const TOP_SIZE = 10;
const RETURN_SIZE = 5;
const THRESHOLD = 0;
function compare(a, b, key, inverted = false) {
    if (a[key] < b[key]) {
        return inverted ? -1 : 1;
    }
    if (a[key] > b[key])
        return inverted ? 1 : -1;
    return 0;
}
function getRecommend(data, key, inverted = false) {
    const sorted = [...data].sort((a, b) => compare(a, b, key, inverted));
    let top = sorted.slice(0, TOP_SIZE);
    top.sort(() => Math.random() - 0.5);
    return top.slice(0, RETURN_SIZE);
}
export async function queryRecommend(diff_nutrient) {
    const random_selected = await IngredientModel.aggregate([
        {
            $match: {
                $or: [
                    { cal: { $ne: 0 } },
                    { fat: { $ne: 0 } },
                    { carb: { $ne: 0 } },
                    { protein: { $ne: 0 } },
                ],
            },
        },
        { $sample: { size: SAMPLE_SIZE } },
    ]);
    let result = {};
    for (const key in diff_nutrient) {
        let typedKey = key;
        let lessKey = ("less_" + String(typedKey));
        if (diff_nutrient[typedKey] > THRESHOLD) {
            result[typedKey] = getRecommend(random_selected, typedKey);
        }
        else if (diff_nutrient[typedKey] < -THRESHOLD) {
            result[typedKey] = getRecommend(random_selected, typedKey, true);
            result[lessKey] = getRecommend(random_selected, typedKey);
        }
    }
    return result;
}
