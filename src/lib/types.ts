export type IngredientCategory =
  | "protein"
  | "vegetable"
  | "dairy"
  | "grain"
  | "fruit"
  | "pantry";

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  confidence?: number;
  category?: IngredientCategory;
}

export type PortionSize = "small" | "regular" | "large";
export type PlanFocus = "protein" | "balanced" | "quick";

export interface Household {
  people: number;
  portions: PortionSize;
  days: number;
  focus: PlanFocus;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  protein: number;
  minutes: number;
  emoji: string;
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: string[];
}

export interface PlannedMeal {
  day: string;
  recipe: Recipe;
  servings: number;
  protein: number;
}

export interface GroceryItem {
  name: string;
  unit: string;
  need: number;
  have: number;
  buy: number;
  category: IngredientCategory;
}

export interface MealPlan {
  days: PlannedMeal[];
  groceries: GroceryItem[];
  usedIngredients: string[];
  summary: {
    meals: number;
    avgProtein: number;
    groceryItems: number;
    people: number;
    days: number;
    servings: number;
  };
  createdAt: string;
}
