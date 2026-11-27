import type { Ingredient } from "./types";

const UNIT_ALIASES: Record<string, string> = {
  kg: "kg",
  g: "g",
  ml: "ml",
  l: "l",
  tbsp: "tbsp",
  tsp: "tsp",
  pcs: "pcs",
};

/** Turn a pasted shopping list into editable inventory items. */
export function parseIngredientList(value: string): Ingredient[] {
  return value
    .split(/[\n,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 40)
    .map((entry) => {
      const match = entry.match(/^(\d+(?:\.\d+)?)\s*(kg|g|ml|l|tbsp|tsp|pcs)?\s*(.*)$/i);
      const name = (match?.[3] ?? entry).trim();
      if (!name) return null;

      return {
        name,
        quantity: match ? Number(match[1]) : 1,
        unit: match?.[2] ? UNIT_ALIASES[match[2].toLowerCase()] ?? "pcs" : "pcs",
        confidence: 1,
      } satisfies Ingredient;
    })
    .filter((item): item is Ingredient => item !== null);
}
