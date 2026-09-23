import React, { useState } from 'react';
import { Recipe, Ingredient, SubstitutionOption, RecipePreferences } from '../types';
import { IngredientList } from './IngredientList';
import { RecipeCustomizer } from './RecipeCustomizer';
import { SubstitutionPanel } from './SubstitutionPanel';
import { mockSubstitutions } from '../data/mockData';
import {
  ChefHat,
  Clock,
  Flame,
  Users,
  UtensilsCrossed,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
  Share2,
  Bookmark,
} from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onStartCooking: () => void;
  onUpdatePreferences: (prefs: RecipePreferences) => Promise<void>;
  onApplySubstitution: (ingredientId: string, sub: SubstitutionOption) => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onStartCooking,
  onUpdatePreferences,
  onApplySubstitution,
  isSaved,
  onToggleSave,
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeSubstituteIngredient, setActiveSubstituteIngredient] = useState<Ingredient | null>(
    null
  );
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 1500);
  };

  return (
    <div className="w-full bg-[#FAF7F0] border border-[#263A20]/15 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#263A20]/10 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#263A20] text-white text-xs font-semibold uppercase tracking-wider">
              {recipe.cuisine}
            </span>
            {recipe.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full bg-[#263A20]/10 text-[#263A20] text-[11px] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#263A20]">
            {recipe.title}
          </h2>

          <p className="text-xs sm:text-sm text-[#263A20]/70">
            Spice Profile: <strong className="text-[#263A20]">{recipe.spiceLevel}</strong> • Servings:{' '}
            <strong className="text-[#263A20]">{recipe.servings}</strong>
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCustomizing((prev) => !prev)}
            className={`border px-4 py-3 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              isCustomizing
                ? 'bg-[#263A20] text-white border-[#263A20]'
                : 'border-[#263A20]/30 hover:border-[#263A20] text-[#263A20] bg-transparent hover:bg-[#263A20]/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isCustomizing ? 'Hide Customizer' : 'Personalize Recipe'}</span>
          </button>

          <button
            type="button"
            onClick={onStartCooking}
            className="bg-[#263A20] hover:bg-[#1C2C17] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-medium shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-2"
          >
            <ChefHat className="w-4 h-4 text-[#A3B89D]" />
            <span>Start Cooking Mode</span>
          </button>

          <button
            type="button"
            onClick={onToggleSave}
            aria-label={isSaved ? 'Remove recipe bookmark' : 'Save recipe bookmark'}
            className="p-3 rounded-full border border-[#263A20]/25 hover:border-[#263A20] text-[#263A20] hover:bg-[#263A20]/5 transition-colors cursor-pointer"
            title="Save to favorites"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-[#263A20]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share recipe"
            className="p-3 rounded-full border border-[#263A20]/25 hover:border-[#263A20] text-[#263A20] hover:bg-[#263A20]/5 transition-colors cursor-pointer relative"
            title="Share recipe"
          >
            <Share2 className="w-4 h-4" />
            {copyFeedback && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#263A20] text-white text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap shadow-xs">
                Copied!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Embedded Recipe Customizer when toggled */}
      {isCustomizing && (
        <div className="animate-in fade-in duration-200">
          <RecipeCustomizer
            currentServings={recipe.servings}
            currentSpice={recipe.spiceLevel}
            onUpdate={onUpdatePreferences}
            onClose={() => setIsCustomizing(false)}
          />
        </div>
      )}

      {/* Metadata Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#EDE5DA]/60 border border-[#263A20]/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#263A20]/10 flex items-center justify-center text-[#263A20]">
            <Clock className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <span className="text-[10px] text-[#263A20]/60 uppercase tracking-wider block">
              Prep
            </span>
            <span className="font-serif font-bold text-sm text-[#263A20]">
              {recipe.prepTimeMinutes} mins
            </span>
          </div>
        </div>

        <div className="bg-[#EDE5DA]/60 border border-[#263A20]/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#263A20]/10 flex items-center justify-center text-[#263A20]">
            <Flame className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <span className="text-[10px] text-[#263A20]/60 uppercase tracking-wider block">
              Cook
            </span>
            <span className="font-serif font-bold text-sm text-[#263A20]">
              {recipe.cookTimeMinutes} mins
            </span>
          </div>
        </div>

        <div className="bg-[#EDE5DA]/60 border border-[#263A20]/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#263A20]/10 flex items-center justify-center text-[#263A20]">
            <UtensilsCrossed className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <span className="text-[10px] text-[#263A20]/60 uppercase tracking-wider block">
              Difficulty
            </span>
            <span className="font-serif font-bold text-sm text-[#263A20]">
              {recipe.difficulty}
            </span>
          </div>
        </div>

        <div className="bg-[#EDE5DA]/60 border border-[#263A20]/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#263A20]/10 flex items-center justify-center text-[#263A20]">
            <Users className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <span className="text-[10px] text-[#263A20]/60 uppercase tracking-wider block">
              Yield
            </span>
            <span className="font-serif font-bold text-sm text-[#263A20]">
              {recipe.servings} Portions
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Ingredients & Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Ingredients (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#263A20]">
              Ingredients ({recipe.ingredients.length})
            </h3>
            <span className="text-[11px] text-[#263A20]/60">Click 'Swap' to substitute</span>
          </div>

          <IngredientList
            ingredients={recipe.ingredients}
            onOpenSubstitute={(ing) => setActiveSubstituteIngredient(ing)}
          />
        </div>

        {/* Right Column: Steps (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#263A20]">
              Step-by-Step Method ({recipe.steps.length})
            </h3>
            <button
              type="button"
              onClick={onStartCooking}
              className="text-xs font-semibold text-[#263A20] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ChefHat className="w-3.5 h-3.5" />
              Open Guided Cooking Mode
            </button>
          </div>

          <div className="space-y-4">
            {recipe.steps.map((step) => (
              <div
                key={step.stepNumber}
                className="bg-[#EDE5DA]/40 border border-[#263A20]/12 rounded-2xl p-4 sm:p-5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#263A20] bg-[#263A20]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Step {step.stepNumber}
                  </span>
                  {step.timerSeconds && (
                    <span className="text-[11px] text-[#263A20]/70 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.round(step.timerSeconds / 60)} min duration
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#263A20] leading-relaxed font-medium">
                  {step.instruction}
                </p>

                {step.sensoryCue && (
                  <div className="text-[11px] text-[#263A20]/75 bg-[#FAF7F0] p-2.5 rounded-xl border border-[#263A20]/10">
                    <strong className="text-[#263A20]">Visual Cue: </strong>
                    {step.sensoryCue}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nutritional Estimate Section */}
      <div className="border-t border-[#263A20]/10 pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-serif font-bold text-base text-[#263A20]">
            Nutritional Estimate (Per Serving)
          </h4>
          <span className="text-[11px] text-[#263A20]/60">AI Approximated</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#FAF7F0] border border-[#263A20]/15 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] text-[#263A20]/60 uppercase tracking-wider block">
              Calories
            </span>
            <span className="font-serif font-bold text-lg text-[#263A20]">
              {recipe.nutrition.calories}
            </span>
            <span className="text-[10px] text-[#263A20]/60 block">kcal</span>
          </div>

          <div className="bg-[#FAF7F0] border border-[#263A20]/15 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] text-[#263A20]/60 uppercase tracking-wider block">
              Protein
            </span>
            <span className="font-serif font-bold text-lg text-[#263A20]">
              {recipe.nutrition.protein}g
            </span>
            <span className="text-[10px] text-[#263A20]/60 block">High density</span>
          </div>

          <div className="bg-[#FAF7F0] border border-[#263A20]/15 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] text-[#263A20]/60 uppercase tracking-wider block">
              Carbs
            </span>
            <span className="font-serif font-bold text-lg text-[#263A20]">
              {recipe.nutrition.carbohydrates}g
            </span>
            <span className="text-[10px] text-[#263A20]/60 block">Net carbs</span>
          </div>

          <div className="bg-[#FAF7F0] border border-[#263A20]/15 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] text-[#263A20]/60 uppercase tracking-wider block">
              Fats
            </span>
            <span className="font-serif font-bold text-lg text-[#263A20]">
              {recipe.nutrition.fat}g
            </span>
            <span className="text-[10px] text-[#263A20]/60 block">Dairy & healthy fats</span>
          </div>
        </div>

        <p className="text-[10px] text-[#263A20]/50 flex items-start gap-1 pt-1">
          <Info className="w-3 h-3 shrink-0 mt-0.5" />
          <span>{recipe.nutrition.disclaimer}</span>
        </p>
      </div>

      {/* Substitution Modal Drawer */}
      {activeSubstituteIngredient && (
        <SubstitutionPanel
          ingredient={activeSubstituteIngredient}
          substitutions={mockSubstitutions.filter(
            (s) => s.targetIngredientId === activeSubstituteIngredient.id
          )}
          onApply={(id, sub) => {
            onApplySubstitution(id, sub);
            setActiveSubstituteIngredient(null);
          }}
          onClose={() => setActiveSubstituteIngredient(null)}
        />
      )}
    </div>
  );
};
