import React from 'react';
import { Award, Sparkles, HelpCircle } from 'lucide-react';

interface AlternativeDish {
  name: string;
  confidence: number;
}

interface ConfidencePanelProps {
  confidence: number;
  dishName: string;
  alternativeDishes: AlternativeDish[];
  onSelectAlternative?: (dishName: string) => void;
}

export const ConfidencePanel: React.FC<ConfidencePanelProps> = ({
  confidence,
  dishName,
  alternativeDishes,
  onSelectAlternative,
}) => {
  return (
    <div className="bg-[#FAF7F0] border border-[#263A20]/15 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header with confidence percentage stamp */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#263A20]/10 flex items-center justify-center text-[#263A20]">
            <Award className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#263A20]">
              AI Vision Confidence
            </h4>
            <p className="text-[11px] text-[#263A20]/65">Deep culinary feature matching</p>
          </div>
        </div>

        {/* Confidence Stamp Badge */}
        <div className="flex items-center gap-2 bg-[#263A20] text-white px-3.5 py-1.5 rounded-full shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#A3B89D]" />
          <span className="font-serif font-bold text-sm tracking-tight">{confidence}% Match</span>
        </div>
      </div>

      {/* Progress Bar Visual */}
      <div className="space-y-1">
        <div className="w-full h-2 bg-[#EDE5DA] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#263A20] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-[#263A20]/60">
          <span>Plate clarity score</span>
          <span>High certainty</span>
        </div>
      </div>

      {/* Alternative Likely Dishes */}
      {alternativeDishes && alternativeDishes.length > 0 && (
        <div className="pt-3 border-t border-[#263A20]/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#263A20]/75">
            <span className="font-medium flex items-center gap-1">
              Alternative Matches
              <HelpCircle className="w-3 h-3 text-[#263A20]/50" />
            </span>
            <span className="text-[11px] text-[#263A20]/50">Select to switch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {alternativeDishes.map((alt) => (
              <button
                key={alt.name}
                type="button"
                onClick={() => onSelectAlternative && onSelectAlternative(alt.name)}
                className="text-left p-2.5 rounded-xl border border-[#263A20]/15 hover:border-[#263A20]/40 bg-[#EDE5DA]/50 hover:bg-[#EDE5DA] transition-all flex items-center justify-between text-xs cursor-pointer group"
              >
                <span className="font-medium text-[#263A20] group-hover:text-[#1C2C17] truncate pr-2">
                  {alt.name}
                </span>
                <span className="text-[11px] text-[#263A20]/60 font-semibold shrink-0">
                  {alt.confidence}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
