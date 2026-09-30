import { generateGeminiJson, isRecord, numberValue, sendError } from '../_lib/gemini.js';
import type { ApiRequest, ApiResponse } from '../_lib/gemini.js';

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const difficulties = ['Easy', 'Medium', 'Challenging'];
const maxImageLength = 5_900_000;

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const body = isRecord(request.body) ? request.body : {};
  if (
    typeof body.image !== 'string' ||
    body.image.length > maxImageLength ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(body.image) ||
    !allowedImageTypes.has(String(body.mimeType))
  ) {
    response.status(400).json({ error: 'Please provide a valid pantry item image.' });
    return;
  }

  try {
    const analysis = await generateGeminiJson(
      [
        'Identify the visible pantry or produce ingredients in the attached image. If no item can be confidently identified, say so and return no recipes.',
        'Suggest up to three practical recipes that meaningfully use the identified ingredient. Do not invent items that are not visible.',
        'Return JSON with detectedIngredient (string), category (string), confidence (0-100 number), pairings (string array), and recipes (array of {id,title,cuisine,difficulty,prepTime,category,matchScore}).',
      ].join('\n'),
      { mimeType: body.mimeType as string, data: body.image },
    );

    const confidence = numberValue(analysis.confidence, 0);
    const normalizedConfidence = Math.max(0, Math.min(100, confidence <= 1 ? confidence * 100 : confidence));
    const recipes = normalizedConfidence >= 60 && Array.isArray(analysis.recipes)
      ? analysis.recipes.filter(isRecord).slice(0, 3).map((recipe, index) => ({
          id: String(recipe.id || `pantry_recipe_${index + 1}`),
          title: String(recipe.title || 'Pantry recipe'),
          cuisine: String(recipe.cuisine || 'Global'),
          difficulty: difficulties.includes(String(recipe.difficulty)) ? String(recipe.difficulty) : 'Easy',
          prepTime: String(recipe.prepTime || '30 min'),
          category: String(recipe.category || analysis.category || 'Main'),
          ...(recipe.badge ? { badge: String(recipe.badge) } : {}),
          ...(recipe.matchScore ? { matchScore: String(recipe.matchScore) } : {}),
        }))
      : [];

    response.status(200).json({
      detectedIngredient: String(analysis.detectedIngredient || 'Unidentified pantry item'),
      category: String(analysis.category || 'Pantry'),
      confidence: normalizedConfidence,
      pairings: Array.isArray(analysis.pairings) ? analysis.pairings.slice(0, 8).map(String) : [],
      recipes,
    });
  } catch (error) {
    sendError(response, error, 'We could not identify this pantry item. Please try again.');
  }
}