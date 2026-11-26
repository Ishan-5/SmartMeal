import { SAMPLE_INGREDIENTS } from "./demo-data";
import { assemblePlan, buildPlan } from "./plan";
import type { Household, Ingredient, MealPlan, PlannedMeal, Recipe } from "./types";
import { youtubeSearchUrl } from "./utils";

export type AiMode = "ai" | "demo";
export type AiProvider = "groq" | "openrouter" | "gemini" | "openai" | "none";

const groqKey = process.env.GROQ_API_KEY;
const groqModel = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const openrouterKey = process.env.OPENROUTER_API_KEY;
// particle is a fast free vision model; nemotron is the slower, more cautious backup.
const openrouterModel = process.env.OPENROUTER_MODEL || "particle-ai/particle-1:free";
const openrouterFallbackModel = process.env.OPENROUTER_FALLBACK_MODEL || "nvidia/nemotron-3.5-super-vl:free";
const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const openaiKey = process.env.OPENAI_API_KEY;
const openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

const providers: AiProvider[] = ["groq", "openrouter", "gemini", "openai"];

function keyFor(provider: AiProvider): string | undefined {
  if (provider === "groq") return groqKey;
  if (provider === "openrouter") return openrouterKey;
  if (provider === "gemini") return geminiKey;
  if (provider === "openai") return openaiKey;
  return undefined;
}

function configured(provider: AiProvider): boolean {
  return provider !== "none" && Boolean(keyFor(provider));
}

function selectedProvider(variable: string): AiProvider | null {
  const value = process.env[variable];
  return value && providers.includes(value as AiProvider) ? (value as AiProvider) : null;
}

/** Photo recognition needs vision, so OpenRouter/Gemini are used here. */
export function getScanProvider(): AiProvider {
  const forced = selectedProvider("AI_SCAN_PROVIDER");
  if (forced) return forced;
  if (openrouterKey) return "openrouter";
  if (geminiKey) return "gemini";
  return "none";
}

/** Planning is text-only, so the much faster Groq model is preferred. */
export function getPlanProvider(): AiProvider {
  if (process.env.AI_PROVIDER === "demo") return "none";
  const forced = selectedProvider("AI_PLAN_PROVIDER") ?? selectedProvider("AI_PROVIDER");
  if (forced) return forced;
  if (groqKey) return "groq";
  if (openrouterKey) return "openrouter";
  if (geminiKey) return "gemini";
  if (openaiKey) return "openai";
  return "none";
}

export function getAiProvider(): AiProvider {
  return getPlanProvider();
}

export function isAiEnabled(): boolean {
  return configured(getScanProvider()) || configured(getPlanProvider());
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

async function askGroq(system: string, prompt: string, image?: ImageInput): Promise<string> {
  if (image) throw new Error("Groq provider does not accept images");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: groqModel,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) throw new Error(`Groq request failed (${response.status}): ${(await response.text()).slice(0, 200)}`);
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned an empty response");
  return text;
}

async function askOpenRouter(system: string, prompt: string, image?: ImageInput): Promise<string> {
  const content: unknown[] = [{ type: "text", text: prompt }];
  if (image) content.push({ type: "image_url", image_url: { url: image.dataUrl, detail: "low" } });

  const models = [openrouterModel, openrouterFallbackModel].filter(
    (model, index, all) => Boolean(model) && all.indexOf(model) === index,
  );
  let lastError: unknown;

  for (const model of models) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openrouterKey}`,
          "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
          "X-Title": "SmartMeal",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content },
          ],
          temperature: 0.2,
          // Reasoning models need room for their thinking plus the JSON answer.
          max_tokens: 4096,
          reasoning: { effort: "low" },
        }),
      });

      if (!response.ok) throw new Error(`OpenRouter ${model} failed (${response.status}): ${(await response.text()).slice(0, 200)}`);
      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error(`OpenRouter ${model} returned an empty response`);
      return text;
    } catch (error) {
      lastError = error;
      console.warn(`[SmartMeal] OpenRouter model ${model} failed, trying backup:`, error);
    }
  }

  throw lastError ?? new Error("OpenRouter is unavailable");
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

async function askWith(provider: AiProvider, system: string, prompt: string, image?: ImageInput): Promise<string> {
  if (provider === "groq") return askGroq(system, prompt, image);
  if (provider === "openrouter") return askOpenRouter(system, prompt, image);
  if (provider === "gemini") return askGemini(system, prompt, image);
  if (provider === "openai") return askOpenAI(system, prompt, image);
  throw new Error("No AI provider configured");
}

async function askChain(order: AiProvider[], system: string, prompt: string, image?: ImageInput): Promise<string> {
  const seen = new Set<AiProvider>();
  const candidates = order.filter((provider) => {
    if (seen.has(provider) || !configured(provider)) return false;
    seen.add(provider);
    return true;
  });
  if (!candidates.length) throw new Error("No AI provider configured");

  let lastError: unknown;
  for (const provider of candidates) {
    try {
      return await askWith(provider, system, prompt, image);
    } catch (error) {
      lastError = error;
      console.warn(`[SmartMeal] ${provider} request failed, trying next provider:`, error);
    }
  }
  throw lastError;
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

function validVideoUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const url = value.trim();
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/.test(url) ? url : null;
}

export async function recogniseIngredients(
  dataUrl: string,
  mimeType: string,
): Promise<{ ingredients: Ingredient[]; mode: AiMode; note?: string }> {
  if (!configured(getScanProvider())) {
    return {
      ingredients: SAMPLE_INGREDIENTS,
      mode: "demo",
      note: "Demo recognition — add an OpenRouter key to recognise your own photos.",
    };
  }

  try {
    const raw = await askChain(
      [getScanProvider(), "openrouter", "gemini", "openai"],
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
  if (!configured(getPlanProvider())) return { plan: buildPlan(inventory, household), mode: "demo" };

  try {
    const raw = await askChain(
      [getPlanProvider(), "groq", "openrouter", "gemini", "openai"],
      "You are a practical home cook planning real household dinners. Reply with JSON only, no markdown: {\"days\":[{\"day\":\"Mon\",\"name\":\"Lemon chicken bowls\",\"protein\":42,\"minutes\":25,\"emoji\":\"🍋\",\"tags\":[\"High protein\"],\"videoUrl\":\"\",\"ingredients\":[{\"name\":\"Chicken breast\",\"quantity\":180,\"unit\":\"g\"}],\"steps\":[\"Cook the rice\",\"Sear the chicken\"]}]}. Ingredient quantities are PER SERVING. Use only units g, pcs, tbsp or ml. Create exactly the requested number of days, Monday onwards. Make every meal protein-forward and realistic. Prefer the available ingredients before adding new ones. Include one short emoji and 2-4 short steps per meal. Leave videoUrl empty unless you know a real YouTube URL.",
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
      const name = String(day.name ?? "Protein bowl");
      const ingredients = cleanIngredients(day.ingredients).map(({ name, quantity, unit }) => ({ name, quantity, unit }));
      if (!ingredients.length) throw new Error("Meal has no ingredients");
      const recipe: Recipe = {
        id: `ai-meal-${index}-${name.replace(/\s+/g, "-").toLowerCase()}`,
        name,
        protein: Number(day.protein) || 30,
        minutes: Number(day.minutes) || 20,
        emoji: String(day.emoji ?? "🍽️"),
        tags: Array.isArray(day.tags) ? day.tags.map(String) : ["AI planned"],
        videoUrl: validVideoUrl(day.videoUrl) ?? youtubeSearchUrl(name),
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
    console.warn("[SmartMeal] planning fell back to local engine:", error);
    return {
      plan: buildPlan(inventory, household),
      mode: "demo",
      note: "AI planning was unavailable, so we used the local planning engine.",
    };
  }
}
