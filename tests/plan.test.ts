import { describe, expect, it } from "vitest";

import { assemblePlan, formatQuantity, normaliseName, servingCount } from "../src/lib/plan";
import type { Household, Ingredient, Recipe } from "../src/lib/types";

const household: Household = { people: 2, portions: "regular", days: 2, focus: "protein" };

const eggRecipe: Recipe = {
  id: "egg-skillet",
  name: "Egg skillet",
  protein: 30,
  minutes: 15,
  emoji: "🍳",
  tags: ["quick"],
  ingredients: [{ name: "eggs", quantity: 2, unit: "pcs" }],
  steps: ["Cook the eggs."],
};

describe("plan helpers", () => {
  it("normalises ingredient aliases and plurals", () => {
    expect(normaliseName("  Chicken ")).toBe("chicken breast");
    expect(normaliseName("Tomatoes")).toBe("cherry tomatoes");
    expect(normaliseName("GREEK YOGURT")).toBe("greek yogurt");
  });

  it("scales servings by household size and portion setting", () => {
    expect(servingCount(household)).toBe(2);
    expect(servingCount({ ...household, people: 3, portions: "large" })).toBe(4);
  });

  it("does not ask for food already in the kitchen", () => {
    const inventory: Ingredient[] = [{ name: "eggs", quantity: 6, unit: "pcs" }];
    const plan = assemblePlan(
      [{ day: "Mon", recipe: eggRecipe, servings: 2, protein: 30 }],
      inventory,
      household,
    );

    expect(plan.groceries).toHaveLength(0);
    expect(plan.summary).toMatchObject({ meals: 1, avgProtein: 30, servings: 2 });
    expect(plan.days[0].recipe.videoUrl).toContain("youtube.com/results");
  });

  it("buys only the missing quantity", () => {
    const inventory: Ingredient[] = [{ name: "eggs", quantity: 2, unit: "pcs" }];
    const plan = assemblePlan(
      [{ day: "Mon", recipe: eggRecipe, servings: 2, protein: 30 }],
      inventory,
      household,
    );

    expect(plan.groceries[0]).toMatchObject({ name: "eggs", need: 4, have: 2, buy: 2 });
  });

  it("formats quantities for humans", () => {
    expect(formatQuantity(1500, "g")).toBe("1.5kg");
    expect(formatQuantity(2, "pcs")).toBe("2 pcs");
  });
});
