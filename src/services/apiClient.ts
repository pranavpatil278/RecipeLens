import {
  AnalysisResult,
  Recipe,
  RecipePreferences,
  SubstitutionOption,
  AssistantMessage,
  DiscoveryRecipe,
} from '../types';

export interface ApiClientConfig {
  baseUrl?: string;
}

export interface AssistantRequestOptions {
  mode?: string;
  image?: Blob | File;
  recipe?: Recipe;
  history?: Array<Pick<AssistantMessage, 'sender' | 'text'>>;
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
    analysis: AnalysisResult,
    preferences?: Partial<RecipePreferences>
  ): Promise<Recipe> {
    const response = await fetch(`${this.baseUrl}/recipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis, preferences }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error || 'We could not generate this recipe. Please try again.');
    return payload as Recipe;
  }

  /**
   * POST /api/v1/substitute
   * JSON: recipe_id, ingredient, constraints
   */
  async getSubstitutions(
    recipe: Recipe,
    ingredient: Recipe['ingredients'][number],
  ): Promise<SubstitutionOption[]> {
    const response = await fetch(`${this.baseUrl}/substitute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe, ingredient }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error || 'We could not find substitutions. Please try again.');
    return Array.isArray(payload?.substitutions) ? payload.substitutions as SubstitutionOption[] : [];
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
        body: JSON.stringify({
          recipeId,
          message,
          currentStep,
          mode: options.mode || 'Normal',
          image,
          mimeType,
          recipe: options.recipe,
          history: options.history,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.text) {
        throw new Error(payload?.error || 'The AI Chef could not respond right now.');
      }
      return payload as AssistantMessage;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('The AI Chef could not respond right now.');
    }
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
