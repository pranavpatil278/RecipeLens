import { randomUUID } from 'node:crypto';
import { generateGeminiJson, isRecord, numberValue, sendError } from '../_lib/gemini.js';
import type { ApiRequest, ApiResponse } from '../_lib/gemini.js';

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const maxImageLength = 5_900_000;

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const body = isRecord(request.body) ? request.body : {};
  const image = body.image;
  const mimeType = body.mimeType;
  if (
    typeof image !== 'string' ||
    image.length > maxImageLength ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(image) ||
    image.length % 4 === 1 ||
    typeof mimeType !== 'string' ||
    !allowedImageTypes.has(mimeType)
  ) {
    response.status(400).json({ error: 'Please provide a valid food image.' });
    return;
  }

  try {
    const analysis = await generateGeminiJson(
      [
        'Identify the food dish shown in the attached image. Be accurate about regional cuisine and list only ingredients that are visually identifiable or strongly supported by the dish.',
        'Return JSON with: dishName (string), confidence (number from 0 to 100), alternativeDishes (array of {name, confidence}), detectedIngredients (array of strings), cuisine (string), difficulty (Easy, Medium, or Challenging), prepTimeMinutes (number), cookTimeMinutes (number), servings (number).',
        'If the image is not food or identification is uncertain, say so and use a low confidence. Do not invent certainty.',
      ].join('\n'),
      { mimeType, data: image },
    );

    const confidence = numberValue(analysis.confidence, 0);
    const difficulty = ['Easy', 'Medium', 'Challenging'].includes(String(analysis.difficulty))
      ? String(analysis.difficulty)
      : 'Medium';
    const result = {
      analysisId: `ana_${randomUUID()}`,
      dishName: String(analysis.dishName || 'Unidentified dish'),
      confidence: Math.max(0, Math.min(100, confidence <= 1 ? confidence * 100 : confidence)),
      alternativeDishes: Array.isArray(analysis.alternativeDishes)
        ? analysis.alternativeDishes.slice(0, 3).filter(isRecord).map((dish) => {
            const dishConfidence = numberValue(dish.confidence, 0);
            return {
              name: String(dish.name || 'Alternative dish'),
              confidence: Math.max(0, Math.min(100, dishConfidence <= 1 ? dishConfidence * 100 : dishConfidence)),
            };
          })
        : [],
      detectedIngredients: Array.isArray(analysis.detectedIngredients)
        ? analysis.detectedIngredients.slice(0, 20).map(String)
        : [],
      cuisine: String(analysis.cuisine || 'Unknown'),
      difficulty,
      prepTimeMinutes: Math.max(0, numberValue(analysis.prepTimeMinutes, 0)),
      cookTimeMinutes: Math.max(0, numberValue(analysis.cookTimeMinutes, 0)),
      servings: Math.max(1, numberValue(analysis.servings, 1)),
    };
    response.status(200).json(result);
  } catch (error) {
    sendError(response, error, 'We could not analyze this photo. Please try again.');
  }
}