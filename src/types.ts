export type AppState =
  | 'INITIAL'
  | 'CAMERA_OPEN'
  | 'IMAGE_SELECTED'
  | 'IMAGE_PREVIEW'
  | 'ANALYZING'
  | 'ANALYSIS_COMPLETE'
  | 'RECIPE_LOADING'
  | 'RECIPE_READY'
  | 'CUSTOMIZING'
  | 'SUBSTITUTING'
  | 'COOKING_MODE'
  | 'ASSISTANT_OPEN'
  | 'INGREDIENT_DISCOVERY'
  | 'ERROR';

export type Viewport3DStatus = 'IDLE' | 'LOADING' | 'SCANNING' | 'READY' | 'ERROR';

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit?: string;
  note?: string;
  category?: 'protein' | 'produce' | 'dairy' | 'spice' | 'pantry';
  substituted?: boolean;
  originalName?: string;
}

export interface SubstitutionOption {
  id: string;
  targetIngredientId: string;
  originalIngredient: string;
  substituteName: string;
  reason: string;
  ratio: string;
  dietaryFit: string[];
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  ingredients: Array<{ name: string; quantity: string }>;
  timerSeconds?: number;
  sensoryCue?: string;
}

export interface NutritionEstimate {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  disclaimer: string;
}

export interface AnalysisResult {
  analysisId: string;
  dishName: string;
  confidence: number;
  alternativeDishes: Array<{ name: string; confidence: number }>;
  detectedIngredients: string[];
  cuisine: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
}

export interface Recipe {
  recipeId: string;
  analysisId?: string;
  title: string;
  cuisine: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  spiceLevel: 'Mild' | 'Medium' | 'Hot';
  dietaryTags: string[];
  ingredients: Ingredient[];
  steps: RecipeStep[];
  nutrition: NutritionEstimate;
}

export interface RecipePreferences {
  servings: number;
  dietaryConstraints: string[];
  spiceLevel: 'Mild' | 'Medium' | 'Hot';
  substitutions: Record<string, string>;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface DiscoveryRecipe {
  id: string;
  title: string;
  cuisine: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
  prepTime: string;
  category: string;
  badge?: string;
  matchScore?: string;
  imageUrl?: string;
}

export interface IngredientDiscoveryResult {
  detectedIngredient: string;
  confidence: number;
  recipes: DiscoveryRecipe[];
}
