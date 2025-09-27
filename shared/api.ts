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
  }>;
}

export interface GenerateMealsRequest {
  ingredients: string[];
}
