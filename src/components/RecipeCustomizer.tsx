import React, { useState } from 'react';
import { Sliders, Plus, Minus, Check, RefreshCw, Flame, Sparkles } from 'lucide-react';
import { RecipePreferences } from '../types';

interface RecipeCustomizerProps {
  currentServings: number;
  currentSpice: 'Mild' | 'Medium' | 'Hot';
  onUpdate: (prefs: RecipePreferences) => Promise<void>;
  onClose?: () => void;
}

export const RecipeCustomizer: React.FC<RecipeCustomizerProps> = ({
  currentServings,
  currentSpice,
  onUpdate,
  onClose,
}) => {
  const [servings, setServings] = useState(currentServings);
  const [spiceLevel, setSpiceLevel] = useState<'Mild' | 'Medium' | 'Hot'>(currentSpice);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const dietaryOptions = [
    'Dairy-Free',
    'Gluten-Free',
    'Low Sodium',
    'Vegetarian Swap',
    'Keto / Low Carb',
  ];

  const toggleDietary = (opt: string) => {
    setSelectedDietary((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    await onUpdate({
      servings,
      spiceLevel,
      dietaryConstraints: selectedDietary,
      substitutions: {},
    });
    setIsUpdating(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      if (onClose) onClose();
    }, 900);
  };

  return (
    <div className="bg-[#FAF7F0] border border-[#263A20]/15 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#263A20]/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#263A20]/10 flex items-center justify-center text-[#263A20]">
            <Sliders className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-[#263A20]">
              Personalize Recipe Ratios
            </h4>
            <p className="text-xs text-[#263A20]/65">Scale servings, dietary adaptations & heat</p>
          </div>
        </div>
      </div>

      {/* Control 1: Servings Scaler */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#EDE5DA]/60 border border-[#263A20]/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#263A20] block">
            Servings Yield
          </span>
          <span className="text-xs text-[#263A20]/65">Auto-scales ingredient measurements</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            disabled={servings <= 1}
            className="w-8 h-8 rounded-full border border-[#263A20]/30 hover:border-[#263A20] disabled:opacity-40 flex items-center justify-center text-[#263A20] hover:bg-[#263A20]/5 cursor-pointer"
            aria-label="Decrease servings"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-serif font-bold text-lg text-[#263A20] w-6 text-center">
            {servings}
          </span>
          <button
            type="button"
            onClick={() => setServings((s) => Math.min(12, s + 1))}
            disabled={servings >= 12}
            className="w-8 h-8 rounded-full border border-[#263A20]/30 hover:border-[#263A20] disabled:opacity-40 flex items-center justify-center text-[#263A20] hover:bg-[#263A20]/5 cursor-pointer"
            aria-label="Increase servings"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Control 2: Heat Level */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#263A20] block">
          Heat & Spice Profile
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['Mild', 'Medium', 'Hot'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSpiceLevel(level)}
              className={`py-2.5 px-3 rounded-2xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                spiceLevel === level
                  ? 'bg-[#263A20] text-white border-[#263A20] shadow-xs'
                  : 'bg-[#FAF7F0] border-[#263A20]/20 text-[#263A20] hover:bg-[#EDE5DA]/40'
              }`}
            >
              <Flame
                className={`w-3.5 h-3.5 ${
                  spiceLevel === level ? 'text-[#A3B89D]' : 'text-[#263A20]/50'
                }`}
              />
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Control 3: Dietary Constraints */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#263A20] block">
          Dietary Adaptations
        </label>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map((opt) => {
            const isSelected = selectedDietary.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleDietary(opt)}
                className={`text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#263A20] text-white border-[#263A20] shadow-2xs'
                    : 'bg-[#FAF7F0] text-[#263A20] border-[#263A20]/20 hover:border-[#263A20]/40'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-[#A3B89D]" />}
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleUpdate}
          disabled={isUpdating}
          className="w-full bg-[#263A20] hover:bg-[#1C2C17] disabled:opacity-50 text-white py-3 px-5 rounded-full text-xs sm:text-sm font-medium shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Recalculating Measurements...
            </>
          ) : showSuccess ? (
            <>
              <Check className="w-4 h-4 text-[#A3B89D]" />
              Recipe Updated Successfully!
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#A3B89D]" />
              Update Recipe
            </>
          )}
        </button>
      </div>
    </div>
  );
};
