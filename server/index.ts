import "./config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { search as searchIngredients } from "./routes/ingredients";
import { generateMeals } from "./routes/meals";
import { generateRecipe } from "./routes/mealRecipe";
import { generateMealImage } from "./routes/mealImage";

export function createServer() {
  const app = express();

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
