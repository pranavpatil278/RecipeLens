import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiApiKey = env.GEMINI_API_KEY;
  const geminiModel = env.GEMINI_MODEL || 'gemini-3.6-flash';

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
          server.middlewares.use('/api/v1/assistant', (request, response, next) => {
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
                const requestBody = JSON.parse(body) as {
                  message?: string;
                  mode?: string;
                  currentStep?: number;
                  image?: string;
                  mimeType?: string;
                };
                if (!requestBody.message?.trim()) throw new Error('Please enter a question for the AI Chef.');
                const modeInstruction = {
                  'Quick answer': 'Answer briefly in 1-3 useful sentences.',
                  Balanced: 'Give a practical answer with enough explanation to act on it.',
                  DeepThink: 'Reason carefully about cooking technique, safety, and tradeoffs before answering. Show the key reasoning briefly.',
                  Research: 'Give a thorough, evidence-aware answer. Be clear about uncertainty and do not invent citations or sources.',
                }[requestBody.mode || 'Balanced'] || 'Give a practical answer with enough explanation to act on it.';
                const prompt = [
                  'You are RecipeLens AI Chef, a precise and friendly culinary assistant.',
                  modeInstruction,
                  requestBody.currentStep ? `The user is currently on cooking step ${requestBody.currentStep}.` : '',
                  'Answer the user directly. Include concrete quantities, temperatures, timing, or visual cues when relevant. Mention food-safety concerns when relevant.',
                  `User question: ${requestBody.message.trim()}`,
                ].filter(Boolean).join('\n');
                const parts: Array<Record<string, unknown>> = [{ text: prompt }];
                if (requestBody.image && requestBody.mimeType?.startsWith('image/')) {
                  parts.push({ inlineData: { mimeType: requestBody.mimeType, data: requestBody.image } });
                }
                const geminiResponse = await fetch(
                  `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts }] }),
                  },
                );
                if (!geminiResponse.ok) {
                  const errorBody = await geminiResponse.text();
                  let detail = `HTTP ${geminiResponse.status}`;
                  try {
                    const parsedError = JSON.parse(errorBody) as { error?: { message?: string } };
                    detail = parsedError.error?.message || detail;
                  } catch {
                    // Keep the HTTP status when Gemini does not return JSON.
                  }
                  throw new Error(`Gemini could not answer this question: ${detail}`);
                }
                const payload = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
                const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
                if (!text) throw new Error('Gemini returned no answer.');
                response.end(JSON.stringify({ id: `msg_${Date.now()}`, sender: 'assistant', text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
              } catch (error) {
                response.statusCode = 422;
                response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'The AI Chef could not answer.' }));
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
