import type { RequestHandler } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import type { VisionIngredientsResponse } from '@shared/api';

const MODEL_NAME = 'gemini-2.5-flash';

function extractArray(text: string): string[] | null {
  if (!text) return null;
  const fence = text.match(/```(?:json)?([\s\S]*?)```/i);
  const body = fence ? fence[1] : text;
  const firstBracket = body.indexOf('[');
  const lastBracket = body.lastIndexOf(']');
  if (firstBracket === -1 || lastBracket === -1) return null;
  const slice = body.slice(firstBracket, lastBracket + 1);
  try { const parsed = JSON.parse(slice); return Array.isArray(parsed) ? parsed.map(x => String(x)) : null; } catch { return null; }
}

export const extractIngredientsFromImage: RequestHandler = async (req, res) => {
  // Multer adds 'file' onto request; we avoid hard Multer type to keep dependency light
  const file = (req as any).file as { buffer: Buffer; mimetype?: string } | undefined;
  if (!file) {
    return res.status(400).json({ error: 'image file required' });
  }
  if (!config.geminiApiKey) {
    return res.status(200).json({ model: 'fallback:no-key', ingredients: [], error: 'missing api key' } as VisionIngredientsResponse);
  }
  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const b64 = file.buffer.toString('base64');
    const prompt = `You are a precise kitchen assistant. The user provides a photo likely of the contents of a refrigerator or a group of food items.\nIdentify distinct edible ingredient items visible (raw or packaged) that a home cook might list in their ingredient inventory.\nReturn ONLY a JSON array of unique ingredient names in lowercase. Keep names short (e.g. "tomato", "spinach", "eggs", "cheddar cheese", "orange juice").\nDo not include brands, utensils, containers, or vague terms like 'food', 'produce'.\nJSON ONLY.`;
    const result = await model.generateContent([
      { inlineData: { data: b64, mimeType: file.mimetype || 'image/jpeg' } },
      { text: prompt }
    ]);
    const rawText = result.response?.text ? result.response.text() : (result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '');
    let ingredients = extractArray(rawText) || [];
    ingredients = [...new Set(ingredients.map(i => i.trim().toLowerCase()).filter(i => i && i.length <= 40))].slice(0, 40);
    const response: VisionIngredientsResponse = { model: MODEL_NAME, ingredients, rawText };
    res.status(200).json(response);
  } catch (err: any) {
    console.error('[gemini:vision:ingredients:error]', err?.message || err);
    const response: VisionIngredientsResponse = { model: MODEL_NAME, ingredients: [], error: 'vision-error' };
    res.status(200).json(response);
  }
};

export default extractIngredientsFromImage;