/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

export interface DemoResponse {
  message: string;
}

export interface GenerateMealsResponse {
  meals: Array<{
    name: string;
    description: string;
    tags: string[];
    source?: 'gemini' | 'fallback';
  }>;
  model?: string;
  rawText?: string; // optional raw model text for debugging
}

export interface GenerateMealsRequest {
  ingredients: string[];
  maxMeals?: number;
}


export interface IngredientSearchResponse {
  query: string;
  count: number;
  results: string[];
}

// Request body for generating a meal image using Gemini image generation.
// model: gemini-2.5-flash-image-preview (see https://ai.google.dev/gemini-api/docs/image-generation)
export interface MealImageRequest {
  mealName: string; // Human readable meal title
  description?: string; // Optional textual description from meal generation
  // Optional style hint (e.g. "natural light food photography, overhead shot").
  styleHint?: string;
  // If true, force regeneration even if cached.
  refresh?: boolean;
}

// Response shape for meal image generation.
export interface MealImageResponse {
  mealName: string;
  model: string; // model used
  // Direct data URL (image/png or image/jpeg). Client can assign to <img src>.
  imageDataUrl?: string;
  // In case multiple images desired later - we start with first only.
  // base64 strings without data: prefix for potential further processing.
  imagesBase64?: string[];
  // If an error occurred.
  error?: string;
  // Whether the value came from cache.
  cached?: boolean;
  // Raw safety / debug info (trimmed) if needed.
  debug?: any;
}
