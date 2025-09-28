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
    calories?: number; // estimated total calories for prepared recipe (2 servings if unspecified in prompt)
    timeMinutes?: number; // estimated active or total time to prepare
    servings?: number; // number of servings recipe yields
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

// REQUEST: generate a recipe with structured output for an existing meal suggestion.
export interface MealRecipeRequest {
  mealName: string;
  // ingredient tags for the meal (subset of user's chosen ingredients)
  tags: string[];
  description?: string;
  calories?: number;
  timeMinutes?: number;
  servings?: number;
  // Force regeneration ignoring cache
  refresh?: boolean;
}

// RESPONSE: structured recipe data
export interface MealRecipeResponse {
  mealName: string;
  model: string;
  ingredients: Array<{ item: string; quantity?: string }>;
  steps: string[]; // ordered instructions
  servings?: number;
  calories?: number; // total calories (may echo or refine)
  timeMinutes?: number; // total time (may echo or refine)
  notes?: string[]; // optional chef tips / substitutions
  error?: string;
  cached?: boolean;
  rawText?: string;
}

// Vision ingredient extraction
export interface VisionIngredientsResponse {
  model: string;
  ingredients: string[];
  rawText?: string; // raw model text (debug)
  error?: string;
}
