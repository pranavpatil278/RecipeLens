import React from 'react';
import { Sparkles, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';

interface ImagePreviewProps {
  imageSrc: string;
  onChangePhoto: () => void;
  onRemovePhoto: () => void;
  onAnalyze: () => void;
  isLoading?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageSrc,
  onChangePhoto,
  onRemovePhoto,
  onAnalyze,
  isLoading = false,
}) => {
  return (
    <div className="w-full bg-[#FAF7F0] border border-[#263A20]/15 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        {/* Visual Preview Container */}
        <div className="relative w-full lg:w-1/2 aspect-4/3 rounded-2xl overflow-hidden bg-[#1C2C17] border border-[#263A20]/20 flex items-center justify-center shadow-inner">
          <img
            src={imageSrc}
            alt="Dish candidate for analysis"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-[#FAF7F0]/90 backdrop-blur-xs text-[#263A20] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#263A20]" />
            Frame Ready for Vision AI
          </div>
        </div>

        {/* Action Controls & Confirmation */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#263A20]/10 text-[#263A20] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#263A20]" />
              Image Loaded
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#263A20]">
              Ready to Inspect Your Dish
            </h3>
            <p className="text-xs sm:text-sm text-[#263A20]/75 leading-relaxed">
              RecipeLens will deconstruct the culinary elements, estimate ingredient ratios, detect culinary heritage, and construct an interactive recipe.
            </p>
          </div>

          {/* Buttons Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isLoading}
              className="bg-[#263A20] hover:bg-[#1C2C17] disabled:opacity-50 text-white px-6 py-3.5 rounded-full text-sm font-medium shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#A3B89D]" />
              Analyze Dish
            </button>

            <button
              type="button"
              onClick={onChangePhoto}
              disabled={isLoading}
              className="border border-[#263A20]/30 hover:border-[#263A20] bg-transparent hover:bg-[#263A20]/5 text-[#263A20] px-5 py-3.5 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Change Photo
            </button>

            <button
              type="button"
              onClick={onRemovePhoto}
              disabled={isLoading}
              className="border border-red-200 text-red-700 hover:bg-red-50 px-4 py-3.5 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
