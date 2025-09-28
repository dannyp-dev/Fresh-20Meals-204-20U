## Fresh Meals 4 U

A friendly meal-planning assistant that helps you turn the ingredients you already have into delicious, realistic recipes — fast. Built with a modern React + Vite frontend and a small Express server that can call Googles Gemini models to generate meal ideas and extract visible ingredients from photos. The app is designed to feel helpful, warm, and effortless: add ingredients, let the kitchen AI suggest meals, and save or schedule your favorites.

### What this application does (short & sweet)
- Let you search for and add ingredients to a persistent "Grocery Bag".
- Scan a photo of your fridge or countertop and automatically detect edible ingredients (vision → ingredient list).
- Generate personalized meal suggestions from the ingredients in your bag using a generative model (Gemini). The UI ranks suggestions by how many required ingredients you already have.
- Show each suggested meal with a short description, estimated calories, prep time, and servings.
- Favorite meals and schedule them on the in-app calendar.
- Provide helpful UI feedback (toasts, animations, and graceful fallbacks) so the experience feels friendly and reliable even when AI calls fail.

### Why you'll like it
It cuts the friction out of meal planning. Instead of staring at a half-empty fridge and wondering what to make, the app offers curated, practical meal ideas you can actually prepare — with a little encouragement and tiny delightful UI moments along the way.

### Quick start (development)
1. Install a recent Node.js (Node 18+ recommended).
2. Install pnpm if you dont have it:

```powershell
npm install -g pnpm
```

3. From the project root (where this `package.json` lives):

```powershell
cd 'C:\Users\dewfe\Fresh Meals 4 U\Fresh-20Meals-204-20U'
pnpm install
pnpm dev
```

The app runs with Vite in development mode. Open the URL printed by Vite to use the app locally.

### Build & production
Build client + server and run the built server:

```powershell
pnpm build
pnpm start
```

### Environment variables
- `GEMINI_API_KEY` — optional but recommended. When present the server will call the Gemini generative and vision models to:
  - generate meal suggestions at `POST /api/meals/generate`
  - extract ingredients from uploaded images at `POST /api/vision/ingredients`

If `GEMINI_API_KEY` is missing, the server returns sensible fallback recipes and keeps the app fully usable for basic flows.

### API (important endpoints)
- `POST /api/meals/generate` — body: `{ ingredients: string[], maxMeals?: number, filters?: any }`. Returns JSON: `{ meals: [{ name, description, tags, calories, timeMinutes, servings }], model?, rawText? }`.
- `POST /api/vision/ingredients` — multipart/form-data with an image file (field `file`). Returns JSON: `{ ingredients: string[], model?, rawText?, error? }`.

Both endpoints fall back gracefully if no API key is configured or the generative call fails.

### Where to look in the code
- Frontend: `client/` — React, routes, components (Grocery Bag, Recommended Meals, Meal Modal, Search, Calendar
- Backend: `server/` — Express routes, config, AI integrations
- Shared types: `shared/` — api shapes used by client/server

### Tech highlights
- React + Vite + TypeScript for the client
- Express for the tiny server API
- Google Generative AI SDK (Gemini) for meal generation & vision-powered ingredient extraction
- Tailwind CSS + a design system of small UI primitives for a pleasant, responsive UI

### Tips for users
- Add at least 3 ingredients to the bag for the best meal ideas.
- Use the image scan when youre short on time — it automatically adds detected items to your Grocery Bag and opens the bag for review.
- If generation returns no results, try adding or removing a few ingredients or check your `GEMINI_API_KEY`.

---

### Simple Instructions
- git clone https://github.com/dannyp-dev/Fresh-20Meals-204-20U
- cd "C:\Users\dewfe\Fresh Meals 4 U\Fresh-20Meals-204-20U"
- npm install -g pnpm
- pnpm install
