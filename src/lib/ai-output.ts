import type { Household, Ingredient, PlannedMeal, Recipe } from "./types";
import { youtubeSearchUrl } from "./utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ALLOWED_UNITS = new Set(["g", "pcs", "tbsp", "ml"]);

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function sanitiseText(value: unknown, fallback: string, maxLength: number): string {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  return text ? text.slice(0, maxLength) : fallback;
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

/** Keep AI-produced ingredients inside the units and ranges the planner understands. */
export function sanitiseIngredients(value: unknown, limit = 20): Ingredient[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((entry): Ingredient[] => {
      const item = asRecord(entry);
      const name = sanitiseText(item.name, "", 80);
      const quantity = clamp(item.quantity, 0.1, 100_000, 1);
      const requestedUnit = sanitiseText(item.unit, "pcs", 16).toLowerCase();
      if (!name) return [];

      return [{
        name,
        quantity,
        unit: ALLOWED_UNITS.has(requestedUnit) ? requestedUnit : "pcs",
        confidence: clamp(item.confidence, 0, 1, 0.8),
      }];
    })
    .slice(0, limit);
}

/** Only allow real YouTube watch URLs; everything else becomes a search link. */
export function sanitiseVideoUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return null;

    const host = url.hostname.toLowerCase();
    let videoId = "";

    if (host === "youtu.be" || host === "www.youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
      if (url.pathname !== "/watch") return null;
      videoId = url.searchParams.get("v") ?? "";
    } else {
      return null;
    }

    return /^[\w-]{6,}$/.test(videoId) ? url.toString() : null;
  } catch {
    return null;
  }
}

function sanitiseList(value: unknown, limit: number, maxLength: number, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const items = value
    .map((entry) => sanitiseText(entry, "", maxLength))
    .filter(Boolean)
    .slice(0, limit);
  return items.length ? items : fallback;
}

/** Turn one untrusted AI meal into a safe, renderable planned meal. */
export function sanitiseMeal(value: unknown, index: number, household: Household): PlannedMeal | null {
  const item = asRecord(value);
  const name = sanitiseText(item.name, `Protein bowl ${index + 1}`, 80);
  const ingredients = sanitiseIngredients(item.ingredients, 8);
  if (!ingredients.length) return null;

  const protein = clamp(item.protein, 1, 100, 30);
  const minutes = clamp(item.minutes, 1, 180, 20);
  const emoji = Array.from(sanitiseText(item.emoji, "🍽️", 8)).slice(0, 2).join("");
  const recipe: Recipe = {
    id: `ai-meal-${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    name,
    protein,
    minutes,
    emoji: emoji || "🍽️",
    tags: sanitiseList(item.tags, 4, 30, ["AI planned"]),
    videoUrl: sanitiseVideoUrl(item.videoUrl) ?? youtubeSearchUrl(name),
    ingredients: ingredients.map(({ name: ingredientName, quantity, unit }) => ({ name: ingredientName, quantity, unit })),
    steps: sanitiseList(item.steps, 6, 180, ["Cook with what you have."]),
  };

  return {
    day: sanitiseText(item.day, DAYS[index % DAYS.length], 12),
    recipe,
    servings: household.people,
    protein,
  };
}

/** Sanitise a full AI day list, preserving the requested week length. */
export function sanitiseMeals(value: unknown, household: Household): PlannedMeal[] {
  if (!Array.isArray(value)) return [];
  const maxDays = Math.min(7, Math.max(1, household.days));
  return value
    .slice(0, maxDays)
    .map((entry, index) => sanitiseMeal(entry, index, household))
    .filter((meal): meal is PlannedMeal => meal !== null);
}
