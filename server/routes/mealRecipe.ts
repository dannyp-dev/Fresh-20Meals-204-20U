import type { RequestHandler } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import type { MealRecipeRequest, MealRecipeResponse } from '@shared/api';

const MODEL_NAME = 'gemini-2.0-flash'; // fast text generation model (can adjust if needed)

// Simple in-memory recipe cache
const recipeCache = new Map<string, MealRecipeResponse>();

function cacheKey(req: MealRecipeRequest) {
  const base = `${req.mealName}__${[...req.tags].sort().join(',')}`.toLowerCase();
  return base;
}

// Extract JSON from a model string response
function extractJson(text: string): any | null {
  if (!text) return null;
  const fenceMatch = text.match(/```(json)?([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[2] : text;
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) return null;
  try { return JSON.parse(candidate.slice(firstBrace, lastBrace + 1)); } catch { return null; }
}

export const generateRecipe: RequestHandler = async (req, res) => {
  const body: MealRecipeRequest = req.body || {};
  const mealName = (body.mealName || '').trim();
  const tags = Array.isArray(body.tags) ? body.tags.slice(0, 30) : [];
  if (!mealName || tags.length === 0) {
    return res.status(400).json({ error: 'mealName and tags required' });
  }

  const key = cacheKey(body);
  if (!body.refresh && recipeCache.has(key)) {
    return res.status(200).json({ ...recipeCache.get(key)!, cached: true });
  }

  if (!config.geminiApiKey) {
    return res.status(200).json({ mealName, model: 'fallback:no-key', error: 'Missing GEMINI_API_KEY', ingredients: [], steps: [] });
  }

  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const assumedBasics = 'water, salt, pepper, cooking oil';
    const prompt = `You are a cooking assistant. Create a concise, clear recipe that ONLY uses the provided meal ingredient tags plus common pantry basics.

Meal Name: ${mealName}
User Ingredient Tags: ${tags.join(', ')}
Assumed common basics (do not list unless essential to a step): ${assumedBasics}.
Provided context (may include nutrition/time/servings): calories=${body.calories || ''} timeMinutes=${body.timeMinutes || ''} servings=${body.servings || ''}

Requirements:
1. Return ONLY valid JSON matching this schema:
{
  "ingredients": [ { "item": string, "quantity": string } ],
  "steps": [ string ],
  "servings": number,
  "calories": number,
  "timeMinutes": number,
  "notes": [ string ]
}
2. Ingredients list must be minimal & derived from tags (you may expand tag to a common form, e.g., "chicken" -> "boneless chicken breast"). Provide approximate, user-friendly quantities.
3. Steps: 4-12 concise imperative sentences. Combine trivial actions.
4. If calories / servings known, keep them. Otherwise infer plausible values.
5. Do not add extraneous keys or commentary; ONLY JSON.
6. Avoid brand names; stay generic.
7. If an ingredient is optional give note instead of listing multiple variants.
8. If a tag represents a sauce or composite (e.g., 'soy sauce'), include directly with quantity.
`;

    const result = await model.generateContent(prompt);
    const rawText = result.response?.text?.() || result.response?.candidates?.[0]?.content?.parts?.map(p => (p as any).text).join('\n') || '';
    const parsed = extractJson(rawText);
    if (!parsed || !Array.isArray(parsed.ingredients) || !Array.isArray(parsed.steps)) {
      const fallback: MealRecipeResponse = {
        mealName,
        model: MODEL_NAME + ':parse-fallback',
        ingredients: tags.map(t => ({ item: t })),
        steps: [ 'Combine listed ingredients appropriately and cook until done.' ],
        servings: body.servings || 2,
        calories: body.calories,
        timeMinutes: body.timeMinutes,
        notes: ['Model parse fallback'],
        rawText,
      };
      recipeCache.set(key, fallback);
      return res.status(200).json(fallback);
    }

    const ingredients = parsed.ingredients
      .filter((i: any) => i && i.item)
      .slice(0, 40)
      .map((i: any) => ({
        item: String(i.item).trim().slice(0, 80),
        quantity: i.quantity ? String(i.quantity).trim().slice(0, 40) : undefined,
      }));
    const steps = parsed.steps
      .filter((s: any) => s && typeof s === 'string')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)
      .slice(0, 20);

    const response: MealRecipeResponse = {
      mealName,
      model: MODEL_NAME,
      ingredients,
      steps,
      servings: Number.isFinite(parsed.servings) ? parsed.servings : (body.servings || undefined),
      calories: Number.isFinite(parsed.calories) ? parsed.calories : (body.calories || undefined),
      timeMinutes: Number.isFinite(parsed.timeMinutes) ? parsed.timeMinutes : (body.timeMinutes || undefined),
      notes: Array.isArray(parsed.notes) ? parsed.notes.slice(0, 10).map((n: any) => String(n).trim()).filter((n: string) => n.length) : undefined,
      rawText,
    };

    recipeCache.set(key, response);
    res.status(200).json(response);
  } catch (err: any) {
    console.error('[gemini:generateRecipe:error]', err?.message || err);
    return res.status(200).json({ mealName, model: MODEL_NAME + ':error', ingredients: [], steps: [], error: err?.message || 'error generating recipe' });
  }
};

export default generateRecipe;