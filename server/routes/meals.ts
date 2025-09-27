import type { RequestHandler } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import type { GenerateMealsRequest, GenerateMealsResponse } from '@shared/api';

// Basic fallback in case model call fails or key missing.
const FALLBACK: GenerateMealsResponse = {
	meals: [
		{ name: 'Lemon Garlic Salmon', description: 'Salmon baked with fresh lemon and garlic.', tags: ['salmon','lemon','garlic'], calories: 620, timeMinutes: 28, servings: 2, source: 'fallback' },
		{ name: 'Pesto Pasta', description: 'Classic basil pesto tossed with pasta and parmesan.', tags: ['basil','parmesan','pasta'], calories: 740, timeMinutes: 25, servings: 3, source: 'fallback' },
		{ name: 'Chicken Caesar Wrap', description: 'Grilled chicken, lettuce and dressing in a tortilla.', tags: ['chicken','lettuce','tortilla'], calories: 540, timeMinutes: 18, servings: 2, source: 'fallback' },
		{ name: 'Veggie Stir Fry', description: 'Mixed vegetables quickly stir-fried in savory sauce.', tags: ['broccoli','carrot','soy sauce'], calories: 410, timeMinutes: 20, servings: 2, source: 'fallback' },
	],
};

const MODEL_NAME = 'gemini-2.0-flash' as const; // per docs: fast text model; adjust if needed

// Helper to extract JSON array/object from model text (handles code fences)
function extractJson(text: string): any | null {
	if (!text) return null;
	const fenceMatch = text.match(/```(json)?([\s\S]*?)```/i);
	const candidate = fenceMatch ? fenceMatch[2] : text;
	const firstBrace = candidate.indexOf('{');
	const lastBrace = candidate.lastIndexOf('}');
	if (firstBrace === -1 || lastBrace === -1) return null;
	const slice = candidate.slice(firstBrace, lastBrace + 1).trim();
	try { return JSON.parse(slice); } catch { return null; }
}

export const generateMeals: RequestHandler = async (req, res) => {
	const body: GenerateMealsRequest = req.body || { ingredients: [] };
	const ingredients = Array.isArray(body.ingredients) ? body.ingredients : [];
	const maxMeals = body.maxMeals && body.maxMeals > 0 && body.maxMeals <= 12 ? body.maxMeals : 6;

	if (ingredients.length === 0) {
		return res.status(400).json({ error: 'ingredients array required' });
	}

	if (!config.geminiApiKey) {
		return res.status(200).json({ ...FALLBACK, model: 'fallback:no-key' });
	}

	try {
		const genAI = new GoogleGenerativeAI(config.geminiApiKey);
		const model = genAI.getGenerativeModel({ model: MODEL_NAME });
		const systemPrompt = `You are a meal suggestion engine.
Given ONLY this list of available ingredients:
${ingredients.join(', ')}

Generate up to ${maxMeals} realistic meal ideas that could plausibly be prepared using ONLY these ingredients (and basic pantry staples: salt, pepper, oil, water).

For each meal provide:
- name: short, appealing
- description: 12-25 words, practical
- tags: array of 2-6 ingredient tokens drawn exactly from the provided list (lowercase)
- calories: integer estimated total calories for the full recipe (not per serving). Choose a plausible value (e.g. 300-1200).
- timeMinutes: integer total time (prep + cook) in minutes (10-120 typical). Use realistic value.
- servings: integer number of servings (1-8 typical, default 2-4 if ambiguous).

Return JSON ONLY with shape:
{ "meals": [ { "name": string, "description": string, "tags": string[], "calories": number, "timeMinutes": number, "servings": number } ] }
No additional keys. Do not include any explanatory text outside JSON. Respond with VALID JSON only.`;

		// Gemini SDK expects an array of content parts or a string; we'll send a single user text prompt.
		const result = await model.generateContent(systemPrompt);

		const rawText = result.response?.text ? result.response.text() : (result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '');
		let parsed: any = extractJson(rawText);
		if (!parsed || !Array.isArray(parsed.meals)) {
			return res.status(200).json({ ...FALLBACK, model: MODEL_NAME + ':parse-fallback', rawText });
		}

		// Normalize & filter
		const meals = parsed.meals
			.filter((m: any) => m && m.name && Array.isArray(m.tags))
			.map((m: any) => {
				const caloriesRaw = Number(m.calories);
				const timeRaw = Number(m.timeMinutes ?? m.time ?? m.minutes);
				const servingsRaw = Number(m.servings ?? m.yields);
				// Basic sanity bounds
				const calories = Number.isFinite(caloriesRaw) && caloriesRaw > 50 && caloriesRaw < 4000 ? Math.round(caloriesRaw) : undefined;
				const timeMinutes = Number.isFinite(timeRaw) && timeRaw > 1 && timeRaw < 600 ? Math.round(timeRaw) : undefined;
				const servings = Number.isFinite(servingsRaw) && servingsRaw >= 1 && servingsRaw <= 16 ? Math.round(servingsRaw) : undefined;
				return {
					name: String(m.name).trim(),
					description: (m.description ? String(m.description) : '').trim().slice(0, 400),
					tags: m.tags.map((t: any) => String(t).toLowerCase()).filter((t: string) => ingredients.some(i => i.toLowerCase().includes(t))),
					calories,
					timeMinutes,
					servings,
					source: 'gemini' as const,
				};
			})
			.filter((m: any) => m.tags.length >= 2);

		if (meals.length === 0) {
			return res.status(200).json({ ...FALLBACK, model: MODEL_NAME + ':empty-fallback', rawText });
		}

		const response: GenerateMealsResponse = { meals, model: MODEL_NAME, rawText };
		res.status(200).json(response);
	} catch (err: any) {
		console.error('[gemini:generateMeals:error]', err?.message || err);
		return res.status(200).json({ ...FALLBACK, model: MODEL_NAME + ':error-fallback' });
	}
};

export default generateMeals;