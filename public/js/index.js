// ------------------------------
// State
// ------------------------------
const state = {
  detectedItems: [],
  progress: { cal: 0, protein: 0, carb: 0, fat: 0 },
};

const FOOD_LIBS = [
  {
    name: "Cơm trắng",
    macrosPer100g: { cal: 130, carb: 28, fat: 0.3, protein: 2.7 },
  },
  {
    name: "Ức gà nướng",
    macrosPer100g: { cal: 165, carb: 0, fat: 3.6, protein: 31 },
  },
  {
    name: "Cá hồi",
    macrosPer100g: { cal: 208, carb: 0, fat: 13, protein: 20 },
  },
  {
    name: "Bông cải xanh",
    macrosPer100g: { cal: 34, carb: 6.6, fat: 0.4, protein: 2.8 },
  },
  {
    name: "Trứng",
    macrosPer100g: { cal: 155, carb: 1.1, fat: 11, protein: 13 },
  },
  {
    name: "Chuối",
    macrosPer100g: { cal: 89, carb: 23, fat: 0.3, protein: 1.1 },
  },
  {
    name: "Sữa chua",
    macrosPer100g: { cal: 59, carb: 3.6, fat: 3.3, protein: 10 },
  },
];

function randomPick(list, count) {
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randPct() {
  return Math.floor(Math.random() * 101); // 0-100%
}

function updateMockProgress() {
  state.progress = {
    cal: randPct(),
    protein: randPct(),
    carb: randPct(),
    fat: randPct(),
  };
}

function computeTotals(items) {
  const totals = { cal: 0, protein: 0, carb: 0, fat: 0 };
  items.forEach((it) => {
    const factor = (it.portion || 100) / 100;
    totals.cal += it.macrosPer100g.cal * factor;
    totals.protein += it.macrosPer100g.protein * factor;
    totals.carb += it.macrosPer100g.carb * factor;
    totals.fat += it.macrosPer100g.fat * factor;
  });
  return totals;
}

function renderDetectedList() {
  const listEl = document.getElementById("detected-list");
  const countEl = document.getElementById("detected-count");
  listEl.innerHTML = "";
  state.detectedItems.forEach((item) => {
    const li = document.createElement("li");
    li.className = "list-group-item";

    const row = document.createElement("div");
    row.className =
      "d-flex align-items-center justify-content-between flex-wrap gap-2";

    const left = document.createElement("div");
    left.className = "d-flex flex-column";
    left.innerHTML = `
      <div class="detected-item-title">${item.name}</div>
      <div class="item-macros">
        <span class="metric-chip">Cal ${item.macrosPer100g.cal} kcal</span>
        <span class="metric-chip">P ${item.macrosPer100g.protein} g</span>
        <span class="metric-chip">C ${item.macrosPer100g.carb} g</span>
        <span class="metric-chip">F ${item.macrosPer100g.fat} g</span>
      </div>
    `;

    row.append(left);
    li.append(row);
    listEl.append(li);
  });
  countEl.textContent = `${state.detectedItems.length} món`;
}

function renderTotals(totals) {
  document.getElementById("sum-cal").textContent = `${Math.round(
    totals.cal
  )} kcal`;
  document.getElementById("sum-protein").textContent = `${Math.round(
    totals.protein
  )} g`;
  document.getElementById("sum-carb").textContent = `${Math.round(
    totals.carb
  )} g`;
  document.getElementById("sum-fat").textContent = `${Math.round(
    totals.fat
  )} g`;
}

function renderProgressBars() {
  const { cal, protein, carb, fat } = state.progress;
  const barCal = document.getElementById("bar-cal");
  const barProtein = document.getElementById("bar-protein");
  const barCarb = document.getElementById("bar-carb");
  const barFat = document.getElementById("bar-fat");
  if (barCal) barCal.style.width = `${cal}%`;
  if (barProtein) barProtein.style.width = `${protein}%`;
  if (barCarb) barCarb.style.width = `${carb}%`;
  if (barFat) barFat.style.width = `${fat}%`;
}

function detectMock() {
  const picks = randomPick(FOOD_LIBS, Math.ceil(Math.random() * 3));
  const withPortion = picks.map((f, i) => ({
    id: Date.now() + i,
    name: f.name,
    portion: 100,
    macrosPer100g: f.macrosPer100g,
  }));
  state.detectedItems = withPortion;
  updateMockProgress();
  renderDetectedList();
  refreshTotals();
}

async function refreshTotals() {
  const totals = computeTotals(state.detectedItems);
  renderTotals(totals);
  renderProgressBars();
}

window.addEventListener("DOMContentLoaded", () => {
  updateMockProgress();
  document
    .getElementById("detectMockBtn")
    ?.addEventListener("click", detectMock);
  renderDetectedList();
  refreshTotals();
});
