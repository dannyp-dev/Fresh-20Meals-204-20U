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
