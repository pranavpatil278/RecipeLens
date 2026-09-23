import React from 'react';
import { Camera, Sparkles, ChefHat, ScanLine, ArrowRight } from 'lucide-react';

interface FeatureBannerProps {
  onStartClick: () => void;
}

export const FeatureBanner: React.FC<FeatureBannerProps> = ({ onStartClick }) => {
  return (
    <section className="w-full bg-transparent pb-14 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Left Zone: Camera Lens Viewfinder Silhouette */}
          <div className="lg:col-span-5 bg-[#1C2C17] min-h-[240px] sm:min-h-[280px] lg:h-full relative overflow-hidden flex flex-col items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-white/10">
            {/* Grid Lines */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="0" x2="60%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="100%" x2="60%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="100%" y1="0" x2="60%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="100%" y1="100%" x2="60%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="60%" cy="50%" r="35%" fill="none" stroke="white" strokeWidth="1" strokeDasharray="2 2" />
              </svg>
            </div>

            {/* Viewfinder Target & Detection Indicator */}
            <div className="relative z-10 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-white/10 border border-white/25 flex items-center justify-center text-white/90 shadow-inner">
                <Camera className="w-7 h-7 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-medium tracking-wide">
                  <ScanLine className="w-3 h-3 text-[#A3B89D]" />
                  Real-Time Plate Detection
                </div>
                <p className="text-[11px] text-white/65 max-w-[220px]">
                  Zero manual typing required. Point at food, receive culinary steps.
                </p>
              </div>
            </div>

            {/* Bottom Counter Silhouette */}
            <div className="absolute bottom-0 inset-x-0 h-8 border-t border-dashed border-white/20 bg-white/5 flex items-center justify-around px-4">
              <span className="text-[9px] text-white/40 tracking-widest uppercase">
                Sensor: Multimodal Food AI
              </span>
            </div>
          </div>

          {/* Center Zone: Headline & Description */}
          <div className="lg:col-span-4 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-4">
            <span className="text-xs font-bold tracking-widest uppercase text-[#A3B89D] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Instant Kitchen Superpower
            </span>

            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white leading-tight">
              Turn food curiosity into homemade mastery.
            </h3>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Never wonder what spices or secret sauces made that restaurant dish unforgettable. Scan, understand the ingredients, and cook it on your stove tonight.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={onStartClick}
                className="inline-flex items-center gap-2 bg-[#FAF7F0] hover:bg-white text-[#263A20] px-5 py-2.5 rounded-full text-xs font-medium shadow-xs transition-colors cursor-pointer"
              >
                <span>Try RecipeLens Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Zone: Line-art Chef Cloche / Plate Illustration */}
          <div className="lg:col-span-3 p-6 sm:p-8 flex items-center justify-center lg:justify-end relative">
            <div className="relative flex items-center gap-3">
              <div className="w-28 h-40 sm:w-32 sm:h-44 border-2 border-white/40 rounded-3xl p-3 flex flex-col justify-between items-center relative bg-white/5 shadow-inner">
                {/* Steam wisps */}
                <div className="w-full flex justify-center gap-2 -mt-4 opacity-70">
                  <div className="w-1 h-4 bg-[#A3B89D] rounded-full animate-pulse" />
                  <div className="w-1 h-6 bg-[#A3B89D] rounded-full animate-pulse [animation-delay:0.3s]" />
                  <div className="w-1 h-3 bg-[#A3B89D] rounded-full animate-pulse [animation-delay:0.6s]" />
                </div>

                {/* Center Chef Emblem */}
                <div className="w-12 h-12 rounded-full border border-dashed border-white/40 flex items-center justify-center text-white/80 my-auto">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>

                <div className="text-center w-full border-t border-white/20 pt-2">
                  <span className="text-[10px] font-bold tracking-widest text-[#A3B89D] uppercase block">
                    Chef Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
