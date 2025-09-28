import type { RequestHandler } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import type { MealImageRequest, MealImageResponse } from '@shared/api';

// Model mandated by user & docs: https://ai.google.dev/gemini-api/docs/image-generation
const IMAGE_MODEL = 'gemini-2.5-flash-image-preview' as const;

// Simple in-memory cache (will be formalized in separate todo if needed)
const imageCache: Record<string, MealImageResponse> = {};

// Build a concise descriptive prompt for the meal leveraging best practices from docs:
// - Clear subject (meal)
// - Style directives kept minimal for realism
// - Avoid brand / watermark / people per safety guidelines
function buildPrompt(mealName: string, description?: string, styleHint?: string) {
	const baseDescription = description ? description.trim() : '';
	const style = styleHint ? styleHint : 'natural realistic food photography, soft daylight, high resolution, 50mm lens, overhead composition';
	return `Photograph of ${mealName}. ${baseDescription}\n${style}. Show only the plated dish on a clean background. No text, no watermark, no people.`;
}

export const generateMealImage: RequestHandler = async (req, res) => {
	const body: MealImageRequest = req.body || {};
	const mealName = (body.mealName || '').trim();
	if (!mealName) {
		return res.status(400).json({ error: 'mealName required' });
	}

	const cacheKey = mealName.toLowerCase();
	if (!body.refresh && imageCache[cacheKey]) {
		return res.status(200).json({ ...imageCache[cacheKey], cached: true });
	}

	if (!config.geminiApiKey) {
		return res.status(200).json({ mealName, model: 'fallback:no-key', error: 'Missing GEMINI_API_KEY' });
	}

	try {
		const genAI = new GoogleGenerativeAI(config.geminiApiKey);
		const model = genAI.getGenerativeModel({ model: IMAGE_MODEL });

		const prompt = buildPrompt(mealName, body.description, body.styleHint);

		// As per docs, call generateContent with text prompt. (For multi-part or image editing, adjust accordingly.)
		let result = await model.generateContent(prompt);
		// Newer SDK versions: image data delivered in response.candidates[].content.parts with inline_data (MIME + base64)
		const candidate = result.response?.candidates?.[0];
		const parts = candidate?.content?.parts || [];
		const imagesBase64: string[] = [];
		const debug: any = { safety: candidate?.safetyRatings, finishReason: candidate?.finishReason };

			function scan(obj: any) {
				if (!obj) return;
				if (Array.isArray(obj)) return obj.forEach(scan);
				if (typeof obj === 'object') {
					// possible keys: inlineData, inline_data
					// @ts-ignore
					const idata = obj.inlineData || obj.inline_data;
					if (idata?.data && typeof idata.data === 'string') {
						imagesBase64.push(idata.data);
					}
					for (const v of Object.values(obj)) scan(v);
				}
			}
			scan(parts);

				if (imagesBase64.length === 0) {
					// Retry with explicit user role content format per docs (sometimes improves correctness). 
					try {
						const structured = await model.generateContent({
							contents: [
								{ role: 'user', parts: [{ text: prompt }] }
							]
						});
						const cand2 = structured.response?.candidates?.[0];
						const parts2 = cand2?.content?.parts || [];
						scan(parts2);
						if (imagesBase64.length === 0) {
							return res.status(200).json({ mealName, model: IMAGE_MODEL, error: 'No image returned', debug: { firstAttempt: debug, secondAttempt: { finishReason: cand2?.finishReason, safety: cand2?.safetyRatings, partsSnapshot: JSON.parse(JSON.stringify(parts2)).slice?.(0,3) ?? parts2 } } });
						}
					} catch (retryErr: any) {
						return res.status(200).json({ mealName, model: IMAGE_MODEL, error: 'No image after retry', debug: { firstAttempt: debug, retryError: retryErr?.message } });
					}
				}

		// Build data URL for first image (assume png unless MIME given)
		// @ts-ignore
		const firstPart = parts.find(p => p.inlineData || p.inline_data);
		// @ts-ignore
		const mime = firstPart?.inlineData?.mimeType || firstPart?.inline_data?.mime_type || 'image/png';
		const imageDataUrl = `data:${mime};base64,${imagesBase64[0]}`;

		const response: MealImageResponse = {
			mealName,
			model: IMAGE_MODEL,
			imageDataUrl,
			imagesBase64,
			cached: false,
			debug,
		};
		imageCache[cacheKey] = response;
		res.status(200).json(response);
	} catch (err: any) {
		console.error('[gemini:mealImage:error]', err?.message || err);
		res.status(200).json({ mealName, model: IMAGE_MODEL + ':error', error: err?.message || 'unknown error' });
	}
};

export default generateMealImage;
