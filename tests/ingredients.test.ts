import { describe, expect, it } from "vitest";

import { parseIngredientList } from "../src/lib/ingredients";

describe("pasted ingredient lists", () => {
  it("splits commas, semicolons and newlines", () => {
    expect(parseIngredientList("eggs, spinach; 500g chicken\n2 tbsp olive oil")).toEqual([
      { name: "eggs", quantity: 1, unit: "pcs", confidence: 1 },
      { name: "spinach", quantity: 1, unit: "pcs", confidence: 1 },
      { name: "chicken", quantity: 500, unit: "g", confidence: 1 },
      { name: "olive oil", quantity: 2, unit: "tbsp", confidence: 1 },
    ]);
  });

  it("keeps plain names at one piece", () => {
    expect(parseIngredientList("Greek yogurt")).toEqual([
      { name: "Greek yogurt", quantity: 1, unit: "pcs", confidence: 1 },
    ]);
  });

  it("ignores empty input and separators", () => {
    expect(parseIngredientList("  , ; \n ")).toEqual([]);
    expect(parseIngredientList("")).toEqual([]);
  });
});
