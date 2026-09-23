import React, { useState } from 'react';
import { Ingredient, SubstitutionOption } from '../types';
import { X, Check, RefreshCw, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface SubstitutionPanelProps {
  ingredient: Ingredient;
  substitutions: SubstitutionOption[];
  onApply: (ingredientId: string, substitute: SubstitutionOption) => void;
  onClose: () => void;
}

export const SubstitutionPanel: React.FC<SubstitutionPanelProps> = ({
  ingredient,
  substitutions,
  onApply,
  onClose,
}) => {
  const [selectedSub, setSelectedSub] = useState<SubstitutionOption | null>(
    substitutions[0] || null
  );
  const [isApplying, setIsApplying] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleApply = () => {
    if (!selectedSub) return;
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setSuccess(true);
      setTimeout(() => {
        onApply(ingredient.id, selectedSub);
      }, 600);
    }, 450);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Substitutions for ${ingredient.name}`}
      className="fixed inset-0 z-50 bg-[#263A20]/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-[#FAF7F0] border border-[#263A20]/20 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-[#263A20]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#263A20]/10 flex items-center justify-center text-[#263A20]">
              <RefreshCw className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#263A20]">
                Smart Substitutions
              </h3>
              <p className="text-[11px] text-[#263A20]/65">
                Target: <span className="font-semibold text-[#263A20]">{ingredient.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close substitution panel"
            className="w-8 h-8 rounded-full border border-[#263A20]/20 flex items-center justify-center text-[#263A20] hover:bg-[#263A20]/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-[#EDE5DA]/70 border border-[#263A20]/10 rounded-2xl p-4 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-[#263A20]/60 uppercase tracking-wider block">
                Original Ingredient
              </span>
              <span className="font-bold text-sm text-[#263A20]">{ingredient.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#263A20]/60 uppercase tracking-wider block">
                Portion
              </span>
              <span className="font-bold text-sm text-[#263A20]">
                {ingredient.quantity} {ingredient.unit || ''}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#263A20] uppercase tracking-wider block">
              Suggested AI Alternatives ({substitutions.length})
            </label>

            {substitutions.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-[#263A20]/20 rounded-2xl text-xs text-[#263A20]/70">
                No direct culinary substitutions for this specialty spice. It provides core identity to the dish.
              </div>
            ) : (
              substitutions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSub(sub)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col space-y-2 ${
                      isSelected
                        ? 'border-[#263A20] bg-[#FAF7F0] shadow-sm ring-1 ring-[#263A20]'
                        : 'border-[#263A20]/15 bg-[#FAF7F0] hover:bg-[#EDE5DA]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#263A20] bg-[#263A20] text-white'
                              : 'border-[#263A20]/30'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="font-serif font-bold text-sm text-[#263A20]">
                          {sub.substituteName}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-[#263A20]/70 bg-[#263A20]/5 px-2 py-0.5 rounded-md">
                        {sub.ratio}
                      </span>
                    </div>

                    <p className="text-xs text-[#263A20]/75 pl-6">{sub.reason}</p>

                    <div className="flex items-center gap-1.5 pl-6 pt-1 flex-wrap">
                      {sub.dietaryFit.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-[#263A20]/10 text-[#263A20] font-medium px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-[#FAF7F0] border-t border-[#263A20]/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#263A20]/75 hover:text-[#263A20] font-medium cursor-pointer"
          >
            Keep Original
          </button>

          <button
            type="button"
            disabled={!selectedSub || isApplying || success}
            onClick={handleApply}
            className="bg-[#263A20] hover:bg-[#1C2C17] disabled:opacity-50 text-white px-5 py-2.5 rounded-full text-xs font-medium transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            {isApplying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Recalculating...
              </>
            ) : success ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#A3B89D]" />
                Substitution Applied!
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Apply Substitution
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
