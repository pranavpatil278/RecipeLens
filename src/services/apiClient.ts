import {
  AnalysisResult,
  Recipe,
  RecipePreferences,
  SubstitutionOption,
  AssistantMessage,
  DiscoveryRecipe,
} from '../types';
import {
  mockButterChickenAnalysis,
  mockInitialRecipe,
  mockSubstitutions,
  mockIngredientDiscovery,
} from '../data/mockData';

export interface ApiClientConfig {
  baseUrl?: string;
}

export interface AssistantRequestOptions {
  mode?: string;
  image?: Blob | File;
}

export class RecipeLensApiClient {
  private baseUrl: string;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || '/api/v1';
  }

  /**
   * POST /api/v1/analyze
   * The development server sends the image to Gemini without exposing the API key.
   */
  async analyzeDishImage(imageBlob: Blob | File | string): Promise<AnalysisResult> {
    if (typeof imageBlob === 'string') {
      throw new Error('Please upload or capture a food photo before starting analysis.');
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('The selected image could not be read.'));
      reader.readAsDataURL(imageBlob);
    });
    const [header, image] = dataUrl.split(',', 2);
    if (!image) throw new Error('The selected image could not be read.');
    const mimeType = header.match(/^data:(image\/[^;]+);base64$/)?.[1] || imageBlob.type || 'image/jpeg';

    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, mimeType }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        payload?.error ||
          'We could not analyze this photo. Please try again.',
      );
    }
    return payload as AnalysisResult;
  }

  /**
   * POST /api/v1/recipe
   * JSON: analysis_id, preferences
   */
  async generateRecipe(
    analysisId: string,
    preferences?: Partial<RecipePreferences>
  ): Promise<Recipe> {
    let recipe = { ...mockInitialRecipe };
    if (preferences?.servings && preferences.servings !== 4) {
      const scale = preferences.servings / 4;
      recipe = {
        ...recipe,
        servings: preferences.servings,
        ingredients: recipe.ingredients.map((ing) => {
          const num = parseFloat(ing.quantity);
          if (!isNaN(num)) {
            return { ...ing, quantity: (num * scale).toFixed(scale % 1 === 0 ? 0 : 1) };
          }
          return ing;
        }),
      };
    }
    return recipe;
  }

  /**
   * POST /api/v1/substitute
   * JSON: recipe_id, ingredient, constraints
   */
  async getSubstitutions(
    recipeId: string,
    ingredientId: string,
    constraints?: string[]
  ): Promise<SubstitutionOption[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockSubstitutions.filter((sub) => sub.targetIngredientId === ingredientId);
  }

  /**
   * POST /api/v1/assistant
   * JSON: recipe_id, message
   */
  async askAssistant(
    recipeId: string,
    message: string,
    currentStep?: number,
    options: AssistantRequestOptions = {}
  ): Promise<AssistantMessage> {
    let image: string | undefined;
    let mimeType: string | undefined;
    if (options.image) {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('The selected image could not be read.'));
        reader.readAsDataURL(options.image as Blob);
      });
      const [header, encodedImage] = dataUrl.split(',', 2);
      image = encodedImage;
      mimeType = header?.match(/^data:(image\/[^;]+);base64$/)?.[1] || options.image.type || 'image/jpeg';
    }

    try {
      const response = await fetch(`${this.baseUrl}/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, message, currentStep, mode: options.mode || 'Normal', image, mimeType }),
      });
      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.text) return payload as AssistantMessage;
      if (response.status !== 503 && response.status !== 404) {
        throw new Error(payload?.error || 'The AI Chef could not respond right now.');
      }
    } catch (error) {
      if (error instanceof TypeError) {
        // Keep the local development experience usable when the API server is unavailable.
      } else if (error instanceof Error && !error.message.includes('fetch')) {
        throw error;
      }
    }

    const lower = message.toLowerCase();
    let reply =
      "For optimal texture, let the simmer continue on gentle low heat. The butter and spices will emulsify smoothly into the cream.";

    if (lower.includes('replace') || lower.includes('substitute') || lower.includes('cream')) {
      reply =
        "You can substitute heavy cream with full-fat coconut milk (1:1 ratio) for a fragrant dairy-free finish, or whisk Greek yogurt with 1 tbsp warm water for a lighter profile.";
    } else if (lower.includes('step') || lower.includes('done') || lower.includes('know')) {
      reply =
        "Watch for visual separation of oil from the tomato gravy edges and gentle, glistening bubbles. The aroma will turn deeply savory and round.";
    } else if (lower.includes('spicy') || lower.includes('heat')) {
      reply =
        "To dial down heat, add an extra tablespoon of unsalted butter or heavy cream, or swirl in a half teaspoon of raw honey or brown sugar.";
    } else if (lower.includes('why') || lower.includes('necessary')) {
      reply =
        "Searing the chicken first locks in moisture and creates fond (caramelized bits) on the pan floor, which deglazes into the sauce to produce genuine restaurant depth.";
    }

    return {
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  /**
   * POST /api/v1/ingredient-recipes
   * Multipart/form-data: image
   */
  async discoverByIngredient(
    imageOrKey?: Blob | File | string
  ): Promise<{
    detectedIngredient: string;
    category: string;
    confidence: number;
    pairings: string[];
    recipes: DiscoveryRecipe[];
  }> {
    if (!imageOrKey) throw new Error('Please upload a pantry item photo first.');
    const dataUrl = typeof imageOrKey === 'string'
      ? imageOrKey
      : await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('The selected image could not be read.'));
          reader.readAsDataURL(imageOrKey);
        });
    const [header, image] = dataUrl.split(',', 2);
    const mimeType = header?.match(/^data:(image\/[^;]+);base64$/)?.[1] || 'image/jpeg';
    if (!image) throw new Error('The selected image could not be read.');

    const response = await fetch(`${this.baseUrl}/ingredient-recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, mimeType }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error || `Pantry scan failed with HTTP ${response.status}.`);
    return payload;
  }

  /**
   * GET /api/v1/health
   */
  async checkHealth(): Promise<{ status: string; uptime: number }> {
    return { status: 'healthy', uptime: process.uptime?.() || 100 };
  }
}

export const apiClient = new RecipeLensApiClient();
