import { SAMPLE_INGREDIENTS } from "./demo-data";
import { assemblePlan, buildPlan } from "./plan";
import type { Household, Ingredient, MealPlan, PlannedMeal, Recipe } from "./types";

export type AiMode = "ai" | "demo";
export type AiProvider = "openrouter" | "gemini" | "openai" | "none";

const openrouterKey = process.env.OPENROUTER_API_KEY;
const openrouterModel = process.env.OPENROUTER_MODEL || "nvidia/nemotron-3.5-super-vl:free";
const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const openaiKey = process.env.OPENAI_API_KEY;
const openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

export function getAiProvider(): AiProvider {
  const forced = process.env.AI_PROVIDER;
  if (forced === "demo") return "none";
  if (forced === "openrouter" && openrouterKey) return "openrouter";
  if (forced === "gemini" && geminiKey) return "gemini";
  if (forced === "openai" && openaiKey) return "openai";
  // OpenRouter has free vision models; Gemini free tier is not available on every project.
  if (openrouterKey) return "openrouter";
  if (geminiKey) return "gemini";
  if (openaiKey) return "openai";
  return "none";
}

export function isAiEnabled(): boolean {
  return getAiProvider() !== "none";
}

interface ImageInput {
  dataUrl: string;
  mimeType: string;
}

function dataUrlParts(dataUrl: string): { data: string; mimeType: string } {
  const [header, data] = dataUrl.split(",");
  const mimeType = header?.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
  return { data: data ?? "", mimeType };
}

async function askGemini(system: string, prompt: string, image?: ImageInput): Promise<string> {
  const imagePart = image
    ? [{ inline_data: { mime_type: image.mimeType || "image/jpeg", data: dataUrlParts(image.dataUrl).data } }]
    : [];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(geminiKey ?? "")}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }, ...imagePart] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    },
  );

  if (!response.ok) throw new Error(`Gemini request failed (${response.status}): ${(await response.text()).slice(0, 200)}`);
  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    promptFeedback?: { blockReason?: string };
  };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!text) throw new Error(data.promptFeedback?.blockReason ?? "Gemini returned an empty response");
  return text;
}

async function askOpenRouter(system: string, prompt: string, image?: ImageInput): Promise<string> {
  const content: unknown[] = [{ type: "text", text: prompt }];
  if (image) content.push({ type: "image_url", image_url: { url: image.dataUrl, detail: "low" } });

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openrouterKey}`,
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
      "X-Title": "SmartMeal",
    },
    body: JSON.stringify({
      model: openrouterModel,
      messages: [
        { role: "system", content: system },
        { role: "user", content },
      ],
      temperature: 0.2,
      // This free vision model reasons before answering; leave room for the JSON.
      max_tokens: 4096,
      reasoning: { effort: "low" },
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter request failed (${response.status}): ${(await response.text()).slice(0, 200)}`);
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenRouter returned an empty response");
  return text;
}

async function askOpenAI(system: string, prompt: string, image?: ImageInput): Promise<string> {
  const content: unknown[] = [{ type: "text", text: prompt }];
  if (image) content.push({ type: "image_url", image_url: { url: image.dataUrl, detail: "low" } });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: openaiModel,
      messages: [
        { role: "system", content: system },
        { role: "user", content },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) throw new Error(`OpenAI request failed (${response.status})`);
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned an empty response");
  return text;
}

async function ask(system: string, prompt: string, image?: ImageInput): Promise<string> {
  const provider = getAiProvider();
  if (provider === "openrouter") return askOpenRouter(system, prompt, image);
  if (provider === "gemini") return askGemini(system, prompt, image);
  if (provider === "openai") return askOpenAI(system, prompt, image);
  throw new Error("No AI provider configured");
}

function parseJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(cleaned) as Record<string, unknown>;
}

function cleanIngredients(value: unknown): Ingredient[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((entry): Ingredient[] => {
      const item = entry as Record<string, unknown>;
      const name = String(item.name ?? "").trim();
      const quantity = Number(item.quantity);
      const unit = String(item.unit ?? "pcs").trim() || "pcs";
      if (!name || !Number.isFinite(quantity) || quantity <= 0) return [];
      return [{
        name,
        quantity,
        unit,
        confidence: typeof item.confidence === "number" ? item.confidence : 0.8,
      }];
    })
    .slice(0, 20);
}

export async function recogniseIngredients(
  dataUrl: string,
  mimeType: string,
): Promise<{ ingredients: Ingredient[]; mode: AiMode; note?: string }> {
  if (!isAiEnabled()) {
    return {
      ingredients: SAMPLE_INGREDIENTS,
      mode: "demo",
      note: "Demo recognition — add a free Gemini key to recognise your own photos.",
    };
  }

  try {
    const raw = await ask(
      "You identify food ingredients in photos for a meal planning app. Reply with JSON only, no markdown: {\"ingredients\":[{\"name\":\"Eggs\",\"quantity\":12,\"unit\":\"pcs\",\"confidence\":0.95}]}. Estimate realistic household quantities. Use only units g, pcs, tbsp or ml. Include only food items clearly visible in the photo.",
      "List the food ingredients visible in this photo with realistic quantities.",
      { dataUrl, mimeType },
    );
    const ingredients = cleanIngredients(parseJson(raw).ingredients);
    if (!ingredients.length) throw new Error("No ingredients found");
    return { ingredients, mode: "ai" };
  } catch (error) {
    console.warn("[SmartMeal] recognition fell back to demo:", error);
    return {
      ingredients: SAMPLE_INGREDIENTS,
      mode: "demo",
      note: "AI recognition was unavailable, so we used a sample inventory.",
    };
  }
}

export async function generatePlan(
  inventory: Ingredient[],
  household: Household,
): Promise<{ plan: MealPlan; mode: AiMode; note?: string }> {
  if (!isAiEnabled()) return { plan: buildPlan(inventory, household), mode: "demo" };

  try {
    const raw = await ask(
      "You are a practical home cook planning real household dinners. Reply with JSON only, no markdown: {\"days\":[{\"day\":\"Mon\",\"name\":\"Lemon chicken bowls\",\"protein\":42,\"minutes\":25,\"emoji\":\"🍋\",\"tags\":[\"High protein\"],\"ingredients\":[{\"name\":\"Chicken breast\",\"quantity\":180,\"unit\":\"g\"}],\"steps\":[\"Cook the rice\",\"Sear the chicken\"]}]}. Ingredient quantities are PER SERVING. Use only units g, pcs, tbsp or ml. Create exactly the requested number of days, Monday onwards. Make every meal protein-forward and realistic. Prefer the available ingredients before adding new ones. Include one short emoji per meal and 2-4 short steps.",
      JSON.stringify({
        available: inventory,
        people: household.people,
        portions: household.portions,
        days: household.days,
        focus: household.focus,
      }),
    );

    const parsed = parseJson(raw);
    if (!Array.isArray(parsed.days) || !parsed.days.length) throw new Error("No days returned");

    const meals: PlannedMeal[] = parsed.days.slice(0, 7).map((entry, index) => {
      const day = entry as Record<string, unknown>;
      const ingredients = cleanIngredients(day.ingredients).map(({ name, quantity, unit }) => ({ name, quantity, unit }));
      if (!ingredients.length) throw new Error("Meal has no ingredients");
      const recipe: Recipe = {
        id: `ai-meal-${index}-${String(day.name ?? "meal").replace(/\s+/g, "-").toLowerCase()}`,
        name: String(day.name ?? "Protein bowl"),
        protein: Number(day.protein) || 30,
        minutes: Number(day.minutes) || 20,
        emoji: String(day.emoji ?? "🍽️"),
        tags: Array.isArray(day.tags) ? day.tags.map(String) : ["AI planned"],
        ingredients,
        steps: Array.isArray(day.steps) ? day.steps.map(String) : ["Cook with what you have."],
      };
      return {
        day: String(day.day ?? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]),
        recipe,
        servings: household.people,
        protein: recipe.protein,
      };
    });

    return { plan: assemblePlan(meals, inventory, household), mode: "ai" };
  } catch (error) {
    console.warn("[SmartMeal] planning fell back to demo:", error);
    return {
      plan: buildPlan(inventory, household),
      mode: "demo",
      note: "AI planning was unavailable, so we used the local planning engine.",
    };
  }
}
