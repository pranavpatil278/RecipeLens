import React from 'react';
import { AnalysisResult } from '../types';
import { ConfidencePanel } from './ConfidencePanel';
import {
  Clock,
  Flame,
  Users,
  UtensilsCrossed,
  Sparkles,
  CheckCircle2,
  ChefHat,
  ArrowRight,
} from 'lucide-react';

interface DishResultProps {
  result: AnalysisResult;
  onProceedToRecipe: () => void;
  onSelectAlternativeDish?: (altName: string) => void;
}

export const DishResult: React.FC<DishResultProps> = ({
  result,
  onProceedToRecipe,
  onSelectAlternativeDish,
}) => {
  return (
    <div className="w-full bg-[#FAF7F0] border border-[#263A20]/15 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#263A20]/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#263A20]/10 text-[#263A20] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#263A20]" />
            Dish Analysis Complete
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#263A20]">
            {result.dishName}
          </h2>
          <p className="text-xs sm:text-sm text-[#263A20]/70 mt-1">
            Cuisine Profile: <strong className="text-[#263A20]">{result.cuisine}</strong>
          </p>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={onProceedToRecipe}
          className="bg-[#263A20] hover:bg-[#1C2C17] text-white px-7 py-3.5 rounded-full text-xs sm:text-sm font-medium shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 self-start sm:self-center"
        >
          <ChefHat className="w-4 h-4 text-[#A3B89D]" />
          <span>View Crafted Recipe</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4-Item Metadata Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#EDE5DA]/70 border border-[#263A20]/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#263A20]/10 flex items-center justify-center text-[#263A20]">
            <Clock className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <span className="text-[11px] text-[#263A20]/60 uppercase tracking-wider block">
              Prep Time
            </span>
            <span className="font-serif font-bold text-sm text-[#263A20]">
              {result.prepTimeMinutes} mins
            </span>
          </div>
        </div>

        <div className="bg-[#EDE5DA]/70 border border-[#263A20]/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#263A20]/10 flex items-center justify-center text-[#263A20]">
            <Flame className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <span className="text-[11px] text-[#263A20]/60 uppercase tracking-wider block">
              Cook Time
            </span>
            <span className="font-serif font-bold text-sm text-[#263A20]">
              {result.cookTimeMinutes} mins
            </span>
          </div>
        </div>

        <div className="bg-[#EDE5DA]/70 border border-[#263A20]/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#263A20]/10 flex items-center justify-center text-[#263A20]">
            <UtensilsCrossed className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <span className="text-[11px] text-[#263A20]/60 uppercase tracking-wider block">
              Difficulty
            </span>
            <span className="font-serif font-bold text-sm text-[#263A20]">
              {result.difficulty}
            </span>
          </div>
        </div>

        <div className="bg-[#EDE5DA]/70 border border-[#263A20]/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#263A20]/10 flex items-center justify-center text-[#263A20]">
            <Users className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <span className="text-[11px] text-[#263A20]/60 uppercase tracking-wider block">
              Yield
            </span>
            <span className="font-serif font-bold text-sm text-[#263A20]">
              {result.servings} Servings
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Confidence & Detected Ingredients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dedicated Confidence Panel */}
        <div className="lg:col-span-5">
          <ConfidencePanel
            confidence={result.confidence}
            dishName={result.dishName}
            alternativeDishes={result.alternativeDishes}
            onSelectAlternative={onSelectAlternativeDish}
          />
        </div>

        {/* Right Column: Detected Ingredients Breakdown */}
        <div className="lg:col-span-7 bg-[#EDE5DA]/50 border border-[#263A20]/15 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-base text-[#263A20]">
              Detected Visual Ingredients ({result.detectedIngredients.length})
            </h4>
            <span className="text-[11px] text-[#263A20]/60 font-medium">Vision Deconstruction</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {result.detectedIngredients.map((ingredient, idx) => (
              <div
                key={idx}
                className="bg-[#FAF7F0] border border-[#263A20]/10 rounded-xl p-3 flex items-center gap-2.5 text-xs text-[#263A20]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#263A20]/80 shrink-0" />
                <span className="font-medium">{ingredient}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-[#263A20]/65 italic">
            * Quantities and step-by-step ratios are automatically calculated in the generated recipe.
          </div>
        </div>
      </div>
    </div>
  );
};
