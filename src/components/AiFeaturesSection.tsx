import React from 'react';
import {
  Scan,
  Utensils,
  ChefHat,
  RefreshCw,
  Smartphone,
  Timer,
  MessageSquare,
  Activity,
  Sparkles,
} from 'lucide-react';

export const AiFeaturesSection: React.FC = () => {
  const features = [
    {
      title: 'Dish Recognition',
      desc: 'Multimodal vision neural network identifies dishes, culinary origin, and difficulty from a single photograph.',
      icon: Scan,
      badge: 'Vision AI',
    },
    {
      title: 'Ingredient Identification',
      desc: 'Deconstructs visible proteins, aromatics, fresh herbs, and emulsified sauces with high precision.',
      icon: Utensils,
      badge: '94% Accuracy',
    },
    {
      title: 'Custom Recipe Generation',
      desc: 'Generates structured culinary recipes tailored to your preferred serving quantities and spice profile.',
      icon: ChefHat,
      badge: 'Chef-Tested',
    },
    {
      title: 'Smart Ingredient Substitution',
      desc: 'Suggests intelligent pantry and dietary alternatives (dairy-free, gluten-free, vegan) with calculated ratios.',
      icon: RefreshCw,
      badge: 'Dietary Safe',
    },
    {
      title: 'Step-by-Step Cooking Mode',
      desc: 'Immersive, high-readability guidance designed for the kitchen counter with dominant instructions and progress dots.',
      icon: Smartphone,
      badge: 'Mobile First',
    },
    {
      title: 'Cooking Timers',
      desc: 'Integrated per-step timers with start, pause, audio completion cues, and visual progress bars.',
      icon: Timer,
      badge: 'Precision',
    },
    {
      title: 'Real-Time Recipe Assistant',
      desc: 'Context-aware AI chef assistant answering questions about texture cues, simmer levels, and adjustments live.',
      icon: MessageSquare,
      badge: 'Contextual AI',
    },
    {
      title: 'Nutrition Estimation',
      desc: 'Instant breakdown of calories, protein, net carbs, and healthy fats based on ingredient portioning.',
      icon: Activity,
      badge: 'Macro Estimates',
    },
  ];

  return (
    <section id="features" className="w-full bg-transparent py-14 sm:py-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-white text-xs font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            Core Capabilities
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-white">
            Everything You Need To Cook Any Plate
          </h2>
          <p className="text-xs sm:text-sm text-white/60">
            Designed specifically for real kitchens, quick pantry decisions, and restaurant recreations.
          </p>
        </div>

        {/* 8-Card Grid matching existing reference card styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-white/35 transition-all shadow-xs hover:shadow-sm group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#263A20] transition-colors">
                      <Icon className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <span className="text-[10px] font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-white pt-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-white/60 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-white/10 flex items-center gap-1 text-[11px] font-semibold text-white">
                  <span>AI Powered</span>
                  <span>•</span>
                  <span className="text-white/40">Integrated</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
