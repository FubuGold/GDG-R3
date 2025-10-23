import * as csvParse from 'csv-parse/sync'
import * as fs from 'fs'

type Ingredient = {
    ingr_name: string,
    ingr_id: string,
    cal: number,
    fat: number,
    carb: number,
    protein: number
}

type Nutrient = {
    cal: number,
    carb: number,
    fat: number,
    protein: number
}

type Recommend = {
    cal?: Ingredient[],
    fat?: Ingredient[],
    carb?: Ingredient[],
    protein?: Ingredient[],
    less_cal?: Ingredient[],
    less_fat?: Ingredient[],
    less_carb?: Ingredient[],
    less_protein?: Ingredient[],
}

const SAMPLE_SIZE = 300;
const TOP_SIZE = 10;
const RETURN_SIZE = 5;
const THRESHOLD = 0;

let original_data: Ingredient[];
const header = ['ingr_name','ingr_id','cal','fat','carb','protein']

function compare(a: Ingredient, b: Ingredient, key: keyof Ingredient,inverted: boolean = false) {
    if (a[key] < b[key]) {
        return inverted ? -1 : 1;
    }
    if (a[key] > b[key]) return inverted ? 1 : -1;
    return 0;
}

export function initRecommend() {
    const filepath = '../database/ingredients_metadata.csv'
    const filecontent = fs.readFileSync(filepath, {encoding : 'utf-8'});
    original_data = csvParse.parse<Ingredient>(filecontent, {columns : true})
    original_data = original_data.filter((e) => !(e['cal'] == 0 && e['carb'] == 0 && e['fat'] == 0 && e['protein'] == 0))
}

function getRecommend(data: Ingredient[], key: keyof Ingredient,inverted: boolean = false) {
    data.sort((a: Ingredient, b: Ingredient) => compare(a,b,"cal",inverted));
    let top = data.slice(0,TOP_SIZE);
    top.sort(() => Math.random() - 0.5);
    return top.slice(0,RETURN_SIZE);
}

export function queryRecommend(diff_nutrient: Nutrient) {
    let random_selected = [...original_data];
    random_selected.sort(() => Math.random() - 0.5);
    random_selected = random_selected.slice(0,SAMPLE_SIZE);
    let result: Recommend = {};
    for (const key in diff_nutrient) {
        let typedKey = key as keyof Nutrient;
        let lessKey = 'less'+String(typedKey) as keyof Recommend;
        if (diff_nutrient[typedKey] > THRESHOLD) {
            result[typedKey] = getRecommend(random_selected,'cal');
        }
        else if (diff_nutrient[typedKey] < -THRESHOLD) {
            result[typedKey] = getRecommend(random_selected,'cal');
            result[lessKey] = getRecommend(random_selected,'cal',true);
        }
    }
    return result;
}