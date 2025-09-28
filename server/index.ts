import "./config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { search as searchIngredients } from "./routes/ingredients";
import { generateMeals } from "./routes/meals";
import { generateRecipe } from "./routes/mealRecipe";
import { generateMealImage } from "./routes/mealImage";
import extractIngredientsFromImage from "./routes/visionIngredients";
import multer from 'multer';

export function createServer() {
  const app = express();

  // Register vision route with per-request dynamic Multer import (prevents bundler static analysis issues)
  // Vision ingredients route (static import). In dev this file is executed in Node context via Vite middleware, so bundling issues are minimal.
  const upload = multer();
  app.post("/api/vision/ingredients", upload.single('image'), extractIngredientsFromImage as any);

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/meals/generate", generateMeals);
  app.post("/api/meals/recipe", generateRecipe);
  app.post("/api/meals/image", generateMealImage);
  app.get("/api/ingredients/search", searchIngredients);

  return app;
}
