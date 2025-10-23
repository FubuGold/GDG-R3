import * as csvParse from 'csv-parse/sync'
import * as fs from 'fs'

type Ingredient = {
    ingr_name: String,
    ingr_id: String,
    cal: Number,
    fat: Number,
    carb: Number,
    protein: Number
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

let data: Ingredient[];
const header = ['ingr_name','ingr_id','cal','fat','carb','protein']

function compare(a: Ingredient, b: Ingredient, key: keyof Ingredient) {
    if (a[key] < b[key]) {
        return -1;
    }
    if (a[key] > b[key]) return 1;
    return 0;
}

export function init() {
    const filepath = '../database/ingredients_metadata.csv'
    const filecontent = fs.readFileSync(filepath, {encoding : 'utf-8'});
    data = csvParse.parse<Ingredient>(filecontent, {columns : true})
}

export function query_recommend(cal: Number,carb: Number, fat: Number, protein: Number) {
    let random_selected = [...data];
    random_selected.sort(() => Math.random() - 0.5);
    random_selected.slice(0,SAMPLE_SIZE);
    if (cal) {
        random_selected.sort((a: Ingredient, b: Ingredient) => compare(a,b,"cal"))
    }
}
