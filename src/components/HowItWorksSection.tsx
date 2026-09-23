import React from 'react';
import { Camera, Sparkles, ChefHat, Sliders, Timer, MessageSquare, ArrowRight } from 'lucide-react';

interface HowItWorksSectionProps {
  onScanClick: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onScanClick }) => {
  const steps = [
    {
      num: '01',
      title: 'Capture Dish',
      desc: 'Snap or upload a photo of any restaurant plate, takeout box, or homemade dish.',
      icon: Camera,
      animation: 'capture',
      gradient: 'linear-gradient(137deg, #FF3D77 0%, #FFB1CE 45%, #FF9D3C 100%)',
    },
    {
      num: '02',
      title: 'AI Vision Analysis',
      desc: 'RecipeLens parses visual textures, identify seasonings, and isolate ingredients.',
      icon: Sparkles,
      animation: 'analysis',
      gradient: 'linear-gradient(137deg, #FFFFFF 0%, #7DD3FC 45%, #06B6D4 100%)',
    },
    {
      num: '03',
      title: 'Recipe Generation',
      desc: 'Synthesizes chef-tested instructions, precise measurements, and preparation steps.',
      icon: ChefHat,
      animation: 'generation',
      gradient: 'linear-gradient(137deg, #4361EE 0%, #E0AEFF 45%, #F72585 100%)',
    },
    {
      num: '04',
      title: 'Personalize & Swap',
      desc: 'Scale servings, choose dietary restrictions (dairy/gluten-free), and swap ingredients.',
      icon: Sliders,
      animation: 'customize',
      gradient: 'linear-gradient(137deg, #34D399 0%, #A7F3D0 45%, #14B8A6 100%)',
    },
    {
      num: '05',
      title: 'Guided Cooking',
      desc: 'Step into focused distraction-free Cooking Mode with integrated timers and visual cues.',
      icon: Timer,
      animation: 'cooking',
      gradient: 'linear-gradient(137deg, #F59E0B 0%, #FDE68A 45%, #EF4444 100%)',
    },
    {
      num: '06',
      title: 'Ask AI Chef',
      desc: 'Query pan temperatures, consistency checks, or troubleshooting anytime live in the kitchen.',
      icon: MessageSquare,
      animation: 'assistant',
      gradient: 'linear-gradient(137deg, #A78BFA 0%, #C4B5FD 45%, #38BDF8 100%)',
    },
  ];

  return (
    <section id="how-it-works" className="w-full bg-transparent py-14 sm:py-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10 sm:mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white/70" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                Workflow &amp; Process
              </span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-white">
              How RecipeLens Works
            </h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-lg">
              From a single snapshot to a plated dinner. Six intelligent stages transforming visual food inspiration into kitchen reality.
            </p>
          </div>

          <button
            type="button"
            onClick={onScanClick}
            className="border border-white/30 hover:border-white px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-xs font-medium text-white"
          >
            <span>Try It With a Photo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6-Item Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="workflow-card relative flex flex-col justify-start items-start w-full group mx-auto"
              >
                <div
                  className="workflow-card__glow absolute w-full h-full opacity-60 rounded-[40px] pointer-events-none"
                  style={{ background: step.gradient, filter: 'blur(45px)' }}
                />
                <div
                  className="workflow-card__surface relative self-stretch min-h-[260px] rounded-[40px] z-10 overflow-hidden group-hover:scale-[1.01] transition-transform duration-500"
                  style={{
                    border: '8px solid transparent',
                    background: `linear-gradient(#1A1A1C, #1A1A1C) padding-box, ${step.gradient} border-box`,
                  }}
                >
                  <div className="w-full h-full min-h-[244px] p-5 sm:p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`workflow-icon workflow-icon--${step.animation} w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#263A20] transition-colors`}>
                          {step.animation === 'generation' && (
                            <span className="workflow-flame-ring" aria-hidden="true" />
                          )}
                          <Icon className="relative z-10 w-5 h-5 stroke-[1.75]" />
                        </div>
                        <span className="font-serif font-bold text-lg text-white/30">
                          {step.num}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>

                    <div className="w-full h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
                      <div className="w-8 h-full bg-white rounded-full group-hover:w-full transition-all duration-500" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
