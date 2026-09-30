import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiApiKey = env.GEMINI_API_KEY;
  const geminiModel = env.GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'recipelens-gemini-analysis-api',
        configureServer(server) {
          server.middlewares.use('/api/v1/analyze', (request, response, next) => {
            if (request.method !== 'POST') return next();

            let body = '';
            request.setEncoding('utf8');
            request.on('data', (chunk) => {
              body += chunk;
              if (body.length > 30 * 1024 * 1024) request.destroy();
            });
            request.on('end', async () => {
              response.setHeader('Content-Type', 'application/json');
              if (!geminiApiKey) {
                response.statusCode = 503;
                response.end(JSON.stringify({ error: 'Add GEMINI_API_KEY to .env.local, then restart the development server.' }));
                return;
              }

              try {
                const { image, mimeType } = JSON.parse(body) as { image?: string; mimeType?: string };
                if (!image || !mimeType?.startsWith('image/')) throw new Error('Please provide a valid image file.');
                const prompt = 'Identify the food dish in this image. Be accurate with regional cuisines. If uncertain, say so and use a lower confidence. Return JSON only: {"dishName":string,"confidence":number,"alternativeDishes":[{"name":string,"confidence":number}],"detectedIngredients":[string],"cuisine":string,"difficulty":"Easy"|"Medium"|"Challenging","prepTimeMinutes":number,"cookTimeMinutes":number,"servings":number}.';
                const requestBody = JSON.stringify({
                  contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: image } }] }],
                  generationConfig: { responseMimeType: 'application/json' },
                });
                let geminiResponse: Response;
                for (let attempt = 0; attempt < 3; attempt += 1) {
                  geminiResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: requestBody,
                    },
                  );
                  const isTransientFailure = [429, 500, 502, 503, 504].includes(geminiResponse.status);
                  if (geminiResponse.ok || !isTransientFailure || attempt === 2) break;
                  await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
                }
                if (!geminiResponse.ok) {
                  const errorBody = await geminiResponse.text();
                  let detail = `HTTP ${geminiResponse.status}`;
                  try {
                    const parsedError = JSON.parse(errorBody) as { error?: { message?: string } };
                    detail = parsedError.error?.message || detail;
                  } catch {
                    // Keep the HTTP status when Gemini does not return JSON.
                  }
                  throw new Error(`Gemini could not analyze this image: ${detail}`);
                }
                const payload = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
                const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('');
                if (!text) throw new Error('Gemini returned no analysis.');
                let analysis: Record<string, unknown>;
                try {
                  analysis = JSON.parse(text.replace(/^```json\s*|\s*```$/g, '')) as Record<string, unknown>;
                } catch {
                  throw new Error('Gemini returned an invalid analysis format. Please try the photo again.');
                }
                const number = (value: unknown, fallback: number) => Number.isFinite(Number(value)) ? Number(value) : fallback;
                const percentage = (value: unknown) => {
                  const normalized = number(value, 0);
                  return normalized <= 1 ? normalized * 100 : normalized;
                };
                const difficulty = ['Easy', 'Medium', 'Challenging'].includes(String(analysis.difficulty))
                  ? String(analysis.difficulty)
                  : 'Medium';

                response.end(JSON.stringify({
                  analysisId: `ana_${Date.now()}`,
                  dishName: String(analysis.dishName || 'Unidentified dish'),
                  confidence: Math.max(0, Math.min(100, percentage(analysis.confidence))),
                  alternativeDishes: Array.isArray(analysis.alternativeDishes)
                    ? analysis.alternativeDishes.slice(0, 3).map((item) => ({
                        name: String((item as Record<string, unknown>).name || 'Alternative dish'),
                        confidence: Math.max(0, Math.min(100, percentage((item as Record<string, unknown>).confidence))),
                      }))
                    : [],
                  detectedIngredients: Array.isArray(analysis.detectedIngredients)
                    ? analysis.detectedIngredients.slice(0, 12).map(String)
                    : [],
                  cuisine: String(analysis.cuisine || 'Unknown'),
                  difficulty,
                  prepTimeMinutes: Math.max(0, number(analysis.prepTimeMinutes, 0)),
                  cookTimeMinutes: Math.max(0, number(analysis.cookTimeMinutes, 0)),
                  servings: Math.max(1, number(analysis.servings, 1)),
                }));
              } catch (error) {
                response.statusCode = 422;
                response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'We could not analyze this image.' }));
              }
            });
          });
          server.middlewares.use('/api/v1/recipe', (request, response, next) => {
            if (request.method !== 'POST') return next();

            let body = '';
            request.setEncoding('utf8');
            request.on('data', (chunk) => {
              body += chunk;
            });
            request.on('end', async () => {
              response.setHeader('Content-Type', 'application/json');
              if (!geminiApiKey) {
                response.statusCode = 503;
                response.end(JSON.stringify({ error: 'Add GEMINI_API_KEY to .env.local, then restart the development server.' }));
                return;
              }

              try {
                process.env.GEMINI_API_KEY = geminiApiKey;
                process.env.GEMINI_MODEL = geminiModel;
                const { default: handler } = await server.ssrLoadModule('/api/v1/recipe.ts');
                const recipeRequest = { method: request.method, body: JSON.parse(body) };
                const recipeResponse = {
                  status(statusCode: number) {
                    response.statusCode = statusCode;
                    return this;
                  },
                  json(payload: unknown) {
                    response.end(JSON.stringify(payload));
                  },
                };
                await handler(recipeRequest, recipeResponse);
              } catch {
                response.statusCode = 400;
                response.end(JSON.stringify({ error: 'We could not generate this recipe. Please try again.' }));
              }
            });
          });
          server.middlewares.use('/api/v1/assistant', (request, response, next) => {
            if (request.method !== 'POST') return next();

            let body = '';
            request.setEncoding('utf8');
            request.on('data', (chunk) => {
              body += chunk;
            });
            request.on('end', async () => {
              response.setHeader('Content-Type', 'application/json');
              if (!geminiApiKey) {
                response.statusCode = 503;
                response.end(JSON.stringify({ error: 'Add GEMINI_API_KEY to .env.local, then restart the development server.' }));
                return;
              }

              try {
                process.env.GEMINI_API_KEY = geminiApiKey;
                process.env.GEMINI_MODEL = geminiModel;
                const { default: handler } = await server.ssrLoadModule('/api/v1/assistant.ts');
                const assistantRequest = { method: request.method, body: JSON.parse(body) };
                const assistantResponse = {
                  status(statusCode: number) {
                    response.statusCode = statusCode;
                    return this;
                  },
                  json(payload: unknown) {
                    response.end(JSON.stringify(payload));
                  },
                };
                await handler(assistantRequest, assistantResponse);
              } catch {
                response.statusCode = 400;
                response.end(JSON.stringify({ error: 'The AI Chef could not answer right now. Please try again.' }));
              }
            });
          });
          server.middlewares.use('/api/v1/substitute', (request, response, next) => {
            if (request.method !== 'POST') return next();

            let body = '';
            request.setEncoding('utf8');
            request.on('data', (chunk) => {
              body += chunk;
            });
            request.on('end', async () => {
              response.setHeader('Content-Type', 'application/json');
              if (!geminiApiKey) {
                response.statusCode = 503;
                response.end(JSON.stringify({ error: 'Add GEMINI_API_KEY to .env.local, then restart the development server.' }));
                return;
              }

              try {
                process.env.GEMINI_API_KEY = geminiApiKey;
                process.env.GEMINI_MODEL = geminiModel;
                const { default: handler } = await server.ssrLoadModule('/api/v1/substitute.ts');
                const substituteRequest = { method: request.method, body: JSON.parse(body) };
                const substituteResponse = {
                  status(statusCode: number) {
                    response.statusCode = statusCode;
                    return this;
                  },
                  json(payload: unknown) {
                    response.end(JSON.stringify(payload));
                  },
                };
                await handler(substituteRequest, substituteResponse);
              } catch {
                response.statusCode = 400;
                response.end(JSON.stringify({ error: 'We could not find substitutions. Please try again.' }));
              }
            });
          });
          server.middlewares.use('/api/v1/ingredient-recipes', (request, response, next) => {
            if (request.method !== 'POST') return next();

            let body = '';
            request.setEncoding('utf8');
            request.on('data', (chunk) => {
              body += chunk;
              if (body.length > 30 * 1024 * 1024) request.destroy();
            });
            request.on('end', async () => {
              response.setHeader('Content-Type', 'application/json');
              if (!geminiApiKey) {
                response.statusCode = 503;
                response.end(JSON.stringify({ error: 'Add GEMINI_API_KEY to .env.local, then restart the development server.' }));
                return;
              }

              try {
                const { image, mimeType } = JSON.parse(body) as { image?: string; mimeType?: string };
                if (!image || !mimeType?.startsWith('image/')) throw new Error('Please provide a valid pantry item image.');
                const prompt = 'You are a careful food-image recognition system. Identify every distinct, prominent pantry or produce item clearly visible in this image; never force a multi-item image into one label. Inspect shape, color, stem, texture, packaging, labels, and context before deciding. Never infer an item from the filename, request text, or a common pantry assumption. For example, three bell peppers in red, yellow, and green must be reported as three visible items: Red bell pepper, Yellow bell pepper, and Green bell pepper (also called capsicum). Distinguish bell pepper/capsicum from chili pepper by the broad lobed shape and lack of a pointed narrow body. Treat brinjal, eggplant, and aubergine as the same ingredient and use the visible color when clear. If the image is empty, blurry, mostly packaging, or an item is not reliably identifiable, use an empty detectedItems list and confidence below 35. Only suggest recipes after all detected items are identified with at least 70 confidence, and every recipe must use at least one exact detected item as a meaningful ingredient. Return JSON only: {"detectedItems":string[],"detectedIngredient":string,"category":string,"confidence":number,"pairings":string[],"recipes":[{"id":string,"title":string,"cuisine":string,"difficulty":"Easy"|"Medium"|"Challenging","prepTime":string,"category":string,"matchScore":string}]}. detectedIngredient should be a concise combined label for the detectedItems. Include at most 3 practical recipes.';
                const requestBody = JSON.stringify({
                  contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: image } }] }],
                  generationConfig: {
                    temperature: 0.1,
                    responseMimeType: 'application/json',
                    responseSchema: {
                      type: 'OBJECT',
                      properties: {
                        detectedItems: { type: 'ARRAY', items: { type: 'STRING' } },
                        detectedIngredient: { type: 'STRING' },
                        category: { type: 'STRING' },
                        confidence: { type: 'NUMBER' },
                        pairings: { type: 'ARRAY', items: { type: 'STRING' } },
                        recipes: {
                          type: 'ARRAY',
                          items: {
                            type: 'OBJECT',
                            properties: {
                              id: { type: 'STRING' },
                              title: { type: 'STRING' },
                              cuisine: { type: 'STRING' },
                              difficulty: { type: 'STRING', enum: ['Easy', 'Medium', 'Challenging'] },
                              prepTime: { type: 'STRING' },
                              category: { type: 'STRING' },
                              matchScore: { type: 'STRING' },
                            },
                            required: ['id', 'title', 'cuisine', 'difficulty', 'prepTime', 'category', 'matchScore'],
                          },
                        },
                      },
                      required: ['detectedItems', 'detectedIngredient', 'category', 'confidence', 'pairings', 'recipes'],
                    },
                  },
                });
                let geminiResponse: Response;
                for (let attempt = 0; attempt < 3; attempt += 1) {
                  geminiResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: requestBody,
                    },
                  );
                  const isTransientFailure = [429, 500, 502, 503, 504].includes(geminiResponse.status);
                  if (geminiResponse.ok || !isTransientFailure || attempt === 2) break;
                  await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
                }
                if (!geminiResponse.ok) {
                  const errorBody = await geminiResponse.text();
                  let detail = `HTTP ${geminiResponse.status}`;
                  try {
                    const parsedError = JSON.parse(errorBody) as { error?: { message?: string } };
                    detail = parsedError.error?.message || detail;
                  } catch {
                    // Keep the HTTP status when Gemini does not return JSON.
                  }
                  throw new Error(`Gemini could not identify this pantry item: ${detail}`);
                }
                const payload = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
                const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('');
                if (!text) throw new Error('Gemini returned no pantry analysis.');
                const analysis = JSON.parse(text.replace(/^```json\s*|\s*```$/g, '')) as Record<string, unknown>;
                const number = (value: unknown, fallback: number) => Number.isFinite(Number(value)) ? Number(value) : fallback;
                const percentage = (value: unknown) => {
                  const normalized = number(value, 0);
                  return normalized <= 1 ? normalized * 100 : normalized;
                };
                const detectedItems = Array.isArray(analysis.detectedItems)
                  ? analysis.detectedItems.slice(0, 12).map(String).filter((item) => item.trim().length > 0)
                  : [];
                const detectedIngredient = String(analysis.detectedIngredient || 'Unidentified pantry item');
                const displayItems = detectedItems.map((item) => /\b(eggplant|aubergine|brinjal)\b/i.test(item)
                  ? 'Brinjal (Eggplant)'
                  : item);
                const displayIngredient = displayItems.length > 0 ? displayItems.join(', ') : 'Unidentified pantry item';
                const confidence = Math.max(0, Math.min(100, percentage(analysis.confidence)));
                const recipes = confidence >= 70 && displayItems.length > 0 && !/^unidentified pantry item$/i.test(displayIngredient)
                  && Array.isArray(analysis.recipes) ? analysis.recipes.slice(0, 3).map((item, index) => {
                  const recipe = item as Record<string, unknown>;
                  const difficulty = ['Easy', 'Medium', 'Challenging'].includes(String(recipe.difficulty))
                    ? String(recipe.difficulty)
                    : 'Easy';
                  return {
                    id: String(recipe.id || `gemini_recipe_${index + 1}`),
                    title: String(recipe.title || 'Pantry recipe'),
                    cuisine: String(recipe.cuisine || 'Global'),
                    difficulty,
                    prepTime: String(recipe.prepTime || '30 min'),
                    category: String(recipe.category || 'Pantry'),
                    matchScore: String(recipe.matchScore || 'AI match'),
                  };
                }) : [];

                response.end(JSON.stringify({
                  detectedIngredient: displayIngredient,
                  detectedItems: displayItems,
                  category: String(analysis.category || 'Pantry'),
                  confidence,
                  pairings: Array.isArray(analysis.pairings) ? analysis.pairings.slice(0, 6).map(String) : [],
                  recipes,
                }));
              } catch (error) {
                response.statusCode = 422;
                response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'We could not identify this pantry item.' }));
              }
            });
          });
        },
      },
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
