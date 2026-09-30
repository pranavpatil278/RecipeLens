import { randomUUID } from 'node:crypto';
import { generateGeminiJson, isRecord, sendError } from '../_lib/gemini.js';
import type { ApiRequest, ApiResponse } from '../_lib/gemini.js';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const body = isRecord(request.body) ? request.body : {};
  const recipe = isRecord(body.recipe) ? body.recipe : null;
  const ingredient = isRecord(body.ingredient) ? body.ingredient : null;
  if (!recipe || !ingredient || typeof ingredient.name !== 'string' || !ingredient.name.trim()) {
    response.status(400).json({ error: 'A recipe and ingredient are required to find substitutions.' });
    return;
  }

  try {
    const result = await generateGeminiJson(
      [
        'Suggest up to four practical culinary replacements for the target ingredient in the recipe. Consider flavor, texture, cooking behavior, dietary fit, and quantity ratio.',
        'Only suggest safe, realistic substitutes. If no suitable substitute exists, return an empty substitutions array.',
        `Recipe context: ${JSON.stringify({ title: recipe.title, cuisine: recipe.cuisine, ingredients: recipe.ingredients })}`,
        `Target ingredient: ${JSON.stringify({ name: ingredient.name, quantity: ingredient.quantity, unit: ingredient.unit })}`,
        'Return JSON with substitutions: an array of {substituteName, reason, ratio, dietaryFit}, where dietaryFit is an array of short strings.',
      ].join('\n'),
    );

    const substitutions = Array.isArray(result.substitutions)
      ? result.substitutions.filter(isRecord).slice(0, 4).map((option) => ({
          id: `sub_${randomUUID()}`,
          targetIngredientId: String(ingredient.id || ''),
          originalIngredient: String(ingredient.name),
          substituteName: String(option.substituteName || ''),
          reason: String(option.reason || ''),
          ratio: String(option.ratio || 'Adjust to taste'),
          dietaryFit: Array.isArray(option.dietaryFit) ? option.dietaryFit.slice(0, 6).map(String) : [],
        })).filter((option) => option.substituteName.length > 0)
      : [];

    response.status(200).json({ substitutions });
  } catch (error) {
    sendError(response, error, 'We could not find substitutions. Please try again.');
  }
}