import React from 'react';
import { Camera, Sparkles, Timer, RefreshCw, ChefHat } from 'lucide-react';

export const FooterBar: React.FC = () => {
  const highlights = [
    {
      icon: Camera,
      title: 'Vision Recognition',
      subtitle: 'Instant dish identification',
    },
    {
      icon: RefreshCw,
      title: 'Smart Substitutions',
      subtitle: 'Dietary & pantry swaps',
    },
    {
      icon: Timer,
      title: 'Cooking Mode',
      subtitle: 'Hands-free guided timers',
    },
    {
      icon: Sparkles,
      title: 'AI Chef Assistant',
      subtitle: 'Real-time culinary guidance',
    },
  ];

  return (
    <footer className="w-full bg-black/40 backdrop-blur-sm border-t border-white/10">
      {/* 4 Feature Highlights Row (Exact original footer card structure) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3.5 lg:justify-center p-2 group cursor-default"
              >
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-white/10 transition-colors shrink-0">
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>

                <div className="flex flex-col">
                  <span className="font-serif font-bold text-xs sm:text-sm text-white">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-white/65">
                    {item.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Footer Links & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white text-[#263A20] flex items-center justify-center">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <span className="font-serif font-bold text-base text-white">
              RecipeLens
            </span>
          </div>
          <span className="hidden sm:inline text-white/40">•</span>
          <p className="text-xs text-white/70">
            "Your camera becomes your AI chef."
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/80">
          <a href="#features" className="hover:text-white hover:underline">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-white hover:underline">
            How It Works
          </a>
          <a href="#recipes" className="hover:text-white hover:underline">
            Signature Recipes
          </a>
          <a
            href="#privacy"
            onClick={(e) => e.preventDefault()}
            className="hover:text-white hover:underline"
          >
            Privacy
          </a>
          <a
            href="#terms"
            onClick={(e) => e.preventDefault()}
            className="hover:text-white hover:underline"
          >
            Terms
          </a>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-white/10 py-4 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center text-[11px] text-white/60">
          © {new Date().getFullYear()} RecipeLens. All rights reserved. Multimodal AI Culinary Intelligence.
        </div>
      </div>
    </footer>
  );
};
