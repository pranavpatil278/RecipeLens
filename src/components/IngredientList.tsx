import React from 'react';
import { Ingredient } from '../types';
import { RefreshCw, Check, Sparkles } from 'lucide-react';

interface IngredientListProps {
  ingredients: Ingredient[];
  onOpenSubstitute?: (ingredient: Ingredient) => void;
  interactive?: boolean;
}

export const IngredientList: React.FC<IngredientListProps> = ({
  ingredients,
  onOpenSubstitute,
  interactive = true,
}) => {
  return (
    <div className="w-full space-y-2.5">
      {ingredients.map((ing) => (
        <div
          key={ing.id}
          className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
            ing.substituted
              ? 'bg-[#E7DFC8] border-[#263A20]/30 shadow-2xs'
              : 'bg-[#FAF7F0] border-[#263A20]/12 hover:border-[#263A20]/30'
          }`}
        >
          {/* Left: Indicator & Ingredient Details */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                ing.substituted
                  ? 'bg-[#263A20] text-white'
                  : 'bg-[#263A20]/10 text-[#263A20]'
              }`}
            >
              {ing.substituted ? '★' : '•'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-xs sm:text-sm text-[#263A20] leading-snug">
                  {ing.name}
                </span>
                {ing.substituted && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-[#263A20] text-white px-2 py-0.5 rounded-full">
                    <Sparkles className="w-2.5 h-2.5 text-[#A3B89D]" />
                    Customized Swap
                  </span>
                )}
              </div>

              {ing.note && (
                <p className="text-[11px] text-[#263A20]/65 italic truncate max-w-xs sm:max-w-md">
                  {ing.note}
                </p>
              )}
              {ing.originalName && (
                <p className="text-[10px] text-[#263A20]/55 line-through truncate">
                  Original: {ing.originalName}
                </p>
              )}
            </div>
          </div>

          {/* Right: Quantity and Optional Substitute Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="font-serif font-bold text-xs sm:text-sm text-[#263A20]">
                {ing.quantity}
              </span>
              {ing.unit && (
                <span className="text-xs text-[#263A20]/75 ml-1">{ing.unit}</span>
              )}
            </div>

            {interactive && onOpenSubstitute && (
              <button
                type="button"
                onClick={() => onOpenSubstitute(ing)}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-full border border-[#263A20]/25 hover:border-[#263A20] text-[#263A20] hover:bg-[#263A20]/5 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                aria-label={`Substitute ${ing.name}`}
                title="Find dietary or pantry substitutes"
              >
                <RefreshCw className="w-3 h-3 text-[#263A20]" />
                <span className="hidden sm:inline">Swap</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
