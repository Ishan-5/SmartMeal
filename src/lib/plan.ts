import { RECIPES } from "./demo-data";
import { youtubeSearchUrl } from "./utils";
import type {
  GroceryItem,
  Household,
  Ingredient,
  IngredientCategory,
  MealPlan,
  PlannedMeal,
  Recipe,
} from "./types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PORTION_FACTOR: Record<Household["portions"], number> = {
  small: 0.8,
  regular: 1,
  large: 1.2,
};

const ALIASES: Record<string, string> = {
  chicken: "chicken breast",
  "chicken breast": "chicken breast",
  yogurt: "greek yogurt",
  "greek yoghurt": "greek yogurt",
  "greek yogurt": "greek yogurt",
  tomato: "cherry tomatoes",
  tomatoes: "cherry tomatoes",
  "cherry tomato": "cherry tomatoes",
  "cherry tomatoes": "cherry tomatoes",
  lemon: "lemons",
  lemons: "lemons",
  egg: "eggs",
  eggs: "eggs",
  spinach: "spinach",
  "brown rice": "brown rice",
  rice: "brown rice",
  flatbread: "flatbreads",
  flatbreads: "flatbreads",
  "olive oil": "olive oil",
  oil: "olive oil",
  "mixed herbs": "mixed herbs",
  herbs: "mixed herbs",
  salmon: "salmon",
  quinoa: "quinoa",
  feta: "feta",
  avocado: "avocado",
};

export function normaliseName(name: string): string {
  const clean = name.toLowerCase().trim().replace(/\s+/g, " ");
  return ALIASES[clean] ?? clean.replace(/es$/, "").replace(/s$/, "");
}

function categoryFor(name: string): IngredientCategory {
  const n = normaliseName(name);
  if (["chicken breast", "eggs", "salmon", "feta"].includes(n)) return "protein";
  if (["greek yogurt", "feta"].includes(n)) return "dairy";
  if (["spinach", "cherry tomatoes", "avocado"].includes(n)) return "vegetable";
  if (["brown rice", "quinoa", "flatbreads"].includes(n)) return "grain";
  if (["lemons"].includes(n)) return "fruit";
  return "pantry";
}

export function portionFactor(household: Household): number {
  return PORTION_FACTOR[household.portions] ?? 1;
}

export function servingCount(household: Household): number {
  return Math.max(1, Math.round(household.people * portionFactor(household)));
}

function roundQuantity(value: number, unit: string): number {
  // Zero must stay zero — otherwise food you already have enough of still
  // appears in the shopping list as "1 pcs".
  if (value <= 0) return 0;
  if (unit === "pcs") return Math.max(1, Math.ceil(value));
  if (unit === "g" || unit === "ml") return Math.ceil(value / 10) * 10;
  return Math.round(value * 10) / 10;
}

function scoreRecipe(
  recipe: Recipe,
  inventory: Ingredient[],
  household: Household,
): number {
  const servings = servingCount(household);
  const have = new Map(inventory.map((i) => [normaliseName(i.name), i.quantity]));
  let coverage = 0;

  for (const item of recipe.ingredients) {
    const available = have.get(normaliseName(item.name)) ?? 0;
    const needed = item.quantity * servings;
    if (available >= needed) coverage += 1;
    else if (available > 0) coverage += 0.45;
  }

  const inventoryScore = (coverage / Math.max(1, recipe.ingredients.length)) * 60;
  const proteinScore = household.focus === "quick" ? 0 : Math.min(30, recipe.protein * 0.6);
  const speedScore = household.focus === "quick" ? Math.max(0, 30 - recipe.minutes) : 0;
  const varietyScore = household.focus === "balanced" ? recipe.tags.length * 2 : 0;
  return inventoryScore + proteinScore + speedScore + varietyScore;
}

/** Choose recipes from the library, favouring what is already in the kitchen. */
export function buildPlan(inventory: Ingredient[], household: Household): MealPlan {
  const days = Math.min(7, Math.max(1, household.days));
  const chosen: PlannedMeal[] = [];
  const used = new Set<string>();

  for (let i = 0; i < days; i += 1) {
    const ranked = RECIPES.filter((r) => !used.has(r.id))
      .map((recipe) => ({ recipe, score: scoreRecipe(recipe, inventory, household) }))
      .sort((a, b) => b.score - a.score);

    const recipe = ranked[0]?.recipe ?? RECIPES[i % RECIPES.length];
    used.add(recipe.id);
    chosen.push({
      day: DAYS[i % DAYS.length],
      recipe,
      servings: servingCount(household),
      protein: recipe.protein,
    });
  }

  return assemblePlan(chosen, inventory, household);
}

/** Turn any set of planned meals (local library or AI) into a plan + grocery list. */
export function assemblePlan(
  meals: PlannedMeal[],
  inventory: Ingredient[],
  household: Household,
): MealPlan {
  // Every meal gets a video link: an exact URL from the AI if it supplied one,
  // otherwise a YouTube search for that dish.
  const linkedMeals = meals.map((meal) => ({
    ...meal,
    recipe: {
      ...meal.recipe,
      videoUrl: meal.recipe.videoUrl || youtubeSearchUrl(meal.recipe.name),
    },
  }));
  const totals = new Map<string, { name: string; unit: string; need: number }>();

  for (const meal of linkedMeals) {
    for (const item of meal.recipe.ingredients) {
      const key = `${normaliseName(item.name)}|${item.unit}`;
      const existing = totals.get(key);
      const amount = item.quantity * meal.servings;
      if (existing) existing.need += amount;
      else totals.set(key, { name: item.name, unit: item.unit, need: amount });
    }
  }

  const inventoryMap = new Map(inventory.map((i) => [normaliseName(i.name), i.quantity]));

  const groceries: GroceryItem[] = Array.from(totals.values())
    .map((item) => {
      const have = inventoryMap.get(normaliseName(item.name)) ?? 0;
      const buy = roundQuantity(Math.max(0, item.need - have), item.unit);
      return {
        name: item.name,
        unit: item.unit,
        need: roundQuantity(item.need, item.unit),
        have: roundQuantity(have, item.unit),
        buy,
        category: categoryFor(item.name),
      };
    })
    .filter((item) => item.buy > 0)
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  const avgProtein = meals.length
    ? Math.round(meals.reduce((sum, m) => sum + m.protein, 0) / meals.length)
    : 0;

  return {
    days: linkedMeals,
    groceries,
    usedIngredients: inventory.map((i) => i.name),
    summary: {
      meals: meals.length,
      avgProtein,
      groceryItems: groceries.length,
      people: household.people,
      days: household.days,
      servings: servingCount(household),
    },
    createdAt: new Date().toISOString(),
  };
}

export function formatQuantity(value: number, unit: string): string {
  if (unit === "g" && value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}kg`;
  if (unit === "ml" && value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}L`;
  const display = Number.isInteger(value) ? value : Math.round(value * 10) / 10;
  return `${display}${unit === "tbsp" || unit === "pcs" ? ` ${unit}` : unit}`;
}
