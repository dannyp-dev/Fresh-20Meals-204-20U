import { RequestHandler } from "express";
import OpenAI from "openai";
import { config } from "../config";

export const generateMeals: RequestHandler = async (req, res) => {
  try {
    const openai = new OpenAI({
      apiKey: config.openaiApiKey,
    });
    
    const { ingredients } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "Invalid ingredients list" });
    }

    const prompt = `
      You are a creative chef. Given these ingredients, generate meal ideas that can be made using only these ingredients.
      Available ingredients: ${ingredients.join(', ')}

      Rules:
      1. Only suggest meals that can be made entirely from the provided ingredients
      2. Each meal must use at least 2 ingredients from the list
      3. Focus on practical, realistic combinations
      4. Include a brief description of the meal

      Respond with a JSON array where each item has:
      - name: The name of the meal
      - description: A brief description
      - tags: Array of ingredients used from the provided list (lowercase)
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const response = JSON.parse(completion.choices[0].message.content);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error generating meals:', error);
    res.status(500).json({ error: "Failed to generate meals" });
  }
};