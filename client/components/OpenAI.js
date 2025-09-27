// Deprecated direct model usage. The server now handles Gemini calls securely.
// This file provides a tiny helper to request meal generation.

export async function requestMeals(ingredients, maxMeals = 6) {
  const resp = await fetch('/api/meals/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, maxMeals })
  });
  if (!resp.ok) throw new Error('Meal generation failed');
  return resp.json();
}