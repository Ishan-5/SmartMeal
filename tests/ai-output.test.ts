import { describe, expect, it } from "vitest";

import { sanitiseIngredients, sanitiseMeal, sanitiseMeals, sanitiseText, sanitiseVideoUrl } from "../src/lib/ai-output";
import type { Household } from "../src/lib/types";

const household: Household = { people: 2, portions: "regular", days: 3, focus: "protein" };

describe("AI output sanitizer", () => {
  it("normalises text without leaking oversized values", () => {
    expect(sanitiseText("  Lemon   chicken  ", "Meal", 40)).toBe("Lemon chicken");
    expect(sanitiseText("", "Meal", 40)).toBe("Meal");
    expect(sanitiseText("x".repeat(100), "Meal", 5)).toBe("xxxxx");
  });

  it("keeps only usable ingredients and clamps their values", () => {
    const ingredients = sanitiseIngredients(
      [
        { name: "Chicken", quantity: 500, unit: "g", confidence: 0.95 },
        { name: "", quantity: 10, unit: "g" },
        { name: "Oil", quantity: -4, unit: "javascript:alert(1)", confidence: 9 },
        { name: "Mystery", quantity: "many", unit: "kg" },
      ],
      5,
    );

    expect(ingredients).toEqual([
      { name: "Chicken", quantity: 500, unit: "g", confidence: 0.95 },
      { name: "Oil", quantity: 0.1, unit: "pcs", confidence: 1 },
      { name: "Mystery", quantity: 1, unit: "pcs", confidence: 0.8 },
    ]);
  });

  it("allows only real YouTube video URLs", () => {
    expect(sanitiseVideoUrl("https://www.youtube.com/watch?v=abc123XYZ")).toContain("youtube.com/watch");
    expect(sanitiseVideoUrl("https://youtu.be/abc123XYZ")).toContain("youtu.be/abc123XYZ");
    expect(sanitiseVideoUrl("http://youtube.com/watch?v=abc123XYZ")).toBeNull();
    expect(sanitiseVideoUrl("javascript:alert(1)")).toBeNull();
    expect(sanitiseVideoUrl("https://evil.example/watch?v=abc123XYZ")).toBeNull();
    expect(sanitiseVideoUrl("https://youtube.com/channel/abc123XYZ")).toBeNull();
  });

  it("builds safe planned meals with defaults", () => {
    const meal = sanitiseMeal(
      {
        day: "Mon",
        name: "Lemon chicken",
        protein: 999,
        minutes: -5,
        emoji: "🍋🍋🍋",
        ingredients: [{ name: "Chicken", quantity: 180, unit: "g" }],
        tags: ["High protein", "".padEnd(200, "x")],
        steps: "not an array",
      },
      0,
      household,
    );

    expect(meal).not.toBeNull();
    expect(meal?.day).toBe("Mon");
    expect(meal?.protein).toBe(100);
    expect(meal?.recipe.minutes).toBe(1);
    expect(meal?.recipe.emoji).toBe("🍋🍋");
    expect(meal?.recipe.tags).toEqual(["High protein", "x".repeat(30)]);
    expect(meal?.recipe.steps).toEqual(["Cook with what you have."]);
    expect(meal?.recipe.videoUrl).toContain("youtube.com/results");
    expect(meal?.servings).toBe(2);
  });

  it("drops meals without ingredients and respects the day cap", () => {
    const meals = sanitiseMeals(
      [
        { name: "Broken", ingredients: [] },
        { name: "Good", ingredients: [{ name: "Eggs", quantity: 2, unit: "pcs" }] },
        { name: "Also good", ingredients: [{ name: "Spinach", quantity: 100, unit: "g" }] },
        { name: "Too many", ingredients: [{ name: "Rice", quantity: 100, unit: "g" }] },
      ],
      household,
    );

    expect(meals).toHaveLength(2);
    expect(meals.map((meal) => meal.recipe.name)).toEqual(["Good", "Also good"]);
  });
});
