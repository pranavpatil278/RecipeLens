import React, { useEffect, useState } from 'react';
import { Check, Sparkles, Loader2, CookingPot, UtensilsCrossed, ScanLine } from 'lucide-react';

interface AnalysisProgressProps {
  onComplete: () => void;
}

export type AnalysisStage =
  | 'Image Received'
  | 'Analyzing Dish'
  | 'Identifying Ingredients'
  | 'Crafting Recipe'
  | 'Ready';

const STAGES: Array<{
  name: AnalysisStage;
  desc: string;
  durationMs: number;
  icon: React.ElementType;
}> = [
  {
    name: 'Image Received',
    desc: 'Normalizing color spectrum, highlights, and culinary framing...',
    durationMs: 250,
    icon: ScanLine,
  },
  {
    name: 'Analyzing Dish',
    desc: 'Matching visual textures, emulsion consistency, and cultural food profiles...',
    durationMs: 350,
    icon: UtensilsCrossed,
  },
  {
    name: 'Identifying Ingredients',
    desc: 'Isolating proteins, herbs, aromatics, and base sauces...',
    durationMs: 400,
    icon: CookingPot,
  },
  {
    name: 'Crafting Recipe',
    desc: 'Synthesizing culinary step ratios, cooking temperatures, and resting times...',
    durationMs: 350,
    icon: Sparkles,
  },
  {
    name: 'Ready',
    desc: 'Full culinary profile generated.',
    durationMs: 200,
    icon: Check,
  },
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ onComplete }) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);

  useEffect(() => {
    let currentIdx = 0;
    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 98) return 98;
        return prev + 2;
      });
    }, 60);

    const advanceStage = () => {
      if (currentIdx < STAGES.length - 1) {
        currentIdx += 1;
        setCurrentStageIdx(currentIdx);
        setTimeout(advanceStage, STAGES[currentIdx].durationMs);
      } else {
        clearInterval(progressInterval);
        setProgressPercent(100);
        onComplete();
      }
    };

    const firstTimer = setTimeout(advanceStage, STAGES[0].durationMs);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  const activeStage = STAGES[currentStageIdx];
  const ActiveIcon = activeStage.icon;

  return (
    <div className="w-full bg-[#EDE5DA]/90 border border-[#263A20]/15 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto my-6">
      {/* Icon Ring with Pulse Activity Indicator */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-[#263A20] text-white flex items-center justify-center shadow-md">
          {currentStageIdx === STAGES.length - 1 ? (
            <Check className="w-9 h-9 stroke-[2.5]" />
          ) : (
            <ActiveIcon className="w-9 h-9 stroke-[1.75] animate-pulse" />
          )}
        </div>
        {currentStageIdx < STAGES.length - 1 && (
          <div className="absolute -inset-2 rounded-full border-2 border-dashed border-[#263A20]/30 animate-spin" />
        )}
      </div>

      {/* Stage Status Headlines */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold tracking-widest text-[#263A20]/70 uppercase">
          AI Vision Pipeline • Stage {currentStageIdx + 1} of {STAGES.length}
        </span>
        <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#263A20]">
          {activeStage.name}
        </h3>
        <p className="text-xs sm:text-sm text-[#263A20]/80 max-w-md mx-auto leading-relaxed">
          {activeStage.desc}
        </p>
      </div>

      {/* Smooth Progress Bar */}
      <div className="w-full max-w-md space-y-2">
        <div className="w-full h-3 bg-[#FAF7F0] border border-[#263A20]/15 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-[#263A20] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-[#263A20]/60 font-medium px-1">
          <span>Processing frame features</span>
          <span>{progressPercent}%</span>
        </div>
      </div>

      {/* Step Indicators Checklist */}
      <div className="w-full max-w-md grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#263A20]/10">
        {STAGES.slice(0, 4).map((stage, idx) => {
          const isDone = currentStageIdx > idx;
          const isCurrent = currentStageIdx === idx;
          return (
            <div
              key={stage.name}
              className={`p-2 rounded-xl text-center border text-[11px] transition-all flex flex-col items-center gap-1 ${
                isDone
                  ? 'bg-[#263A20]/10 border-[#263A20]/25 text-[#263A20] font-medium'
                  : isCurrent
                  ? 'bg-[#263A20] text-white border-[#263A20] shadow-xs'
                  : 'bg-transparent border-[#263A20]/10 text-[#263A20]/40'
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] border border-current">
                {isDone ? '✓' : idx + 1}
              </span>
              <span className="truncate w-full">{stage.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
