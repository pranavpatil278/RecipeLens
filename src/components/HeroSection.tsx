import React from 'react';
import { Camera, Upload, Sparkles, Utensils, Sliders } from 'lucide-react';
import { AIRecipeScanner } from './AIRecipeScanner';
import { AnalysisResult, Viewport3DStatus } from '../types';

interface HeroSectionProps {
  onCaptureClick: () => void;
  onUploadClick: () => void;
  imageSrc?: string | null;
  isAnalyzing?: boolean;
  analysisStage?: string;
  analysisResult?: AnalysisResult | null;
  viewportStatus?: Viewport3DStatus;
  onViewportStatusChange?: (status: Viewport3DStatus) => void;
  onAnalyze?: () => void;
  onChangePhoto?: () => void;
  onRemovePhoto?: () => void;
  onSelectSample?: (sampleKey: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onCaptureClick,
  onUploadClick,
  imageSrc,
  isAnalyzing,
  analysisStage,
  analysisResult,
  viewportStatus,
  onViewportStatusChange,
  onAnalyze,
  onChangePhoto,
  onRemovePhoto,
  onSelectSample,
}) => {
  return (
    <section id="home" className="w-full bg-transparent pt-6 sm:pt-10 pb-12 sm:pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Typography Hierarchy & CTA */}
          <div className="lg:col-span-6 flex flex-col space-y-6 sm:space-y-8">
            {/* 3-Tier Display Headline */}
            <div className="space-y-1.5 sm:space-y-2">
              <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-none tracking-tight">
                SNAP.
              </h1>
              <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-none tracking-tight">
                ANALYZE.
              </h1>
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-none tracking-tight">
                  COOK WITH AI.
                </h1>
                <div className="text-white flex-shrink-0 animate-pulse">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[1.75]" />
                </div>
              </div>
            </div>

            {/* Subtitle Lines */}
            <div className="space-y-1.5 pt-1">
              <p className="text-base sm:text-lg font-serif italic text-white leading-snug">
                "Your camera becomes your AI chef."
              </p>
              <p className="text-xs sm:text-sm text-white/60 max-w-lg leading-relaxed">
                Capture any plate, takeout meal, or raw ingredient. RecipeLens identifies the dish, detects key ingredients, generates customized recipes, and guides your cooking step-by-step.
              </p>
            </div>

            {/* CTA Button Group */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Primary Capture Dish Button */}
              <button
                type="button"
                onClick={onCaptureClick}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white px-7 py-3.5 rounded-full flex items-center gap-2.5 shadow-sm hover:shadow transition-all cursor-pointer text-xs sm:text-sm font-medium"
                aria-label="Capture dish with live camera"
              >
                <Camera className="w-4 h-4 text-white" />
                <span>Capture Dish</span>
              </button>

              {/* Secondary Upload Photo Button */}
              <button
                type="button"
                onClick={onUploadClick}
                className="border border-white/40 hover:border-white bg-transparent hover:bg-white/10 text-white px-7 py-3.5 rounded-full flex items-center gap-2.5 transition-colors cursor-pointer text-xs sm:text-sm font-medium"
                aria-label="Upload dish photo from device"
              >
                <Upload className="w-4 h-4 text-white" />
                <span>Upload Photo</span>
              </button>
            </div>

            {/* 3-Column Value Proposition / Feature Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 sm:pt-6 border-t border-white/15 max-w-md">
              {/* Item 1: Instant Dish Recognition */}
              <div className="flex flex-col items-start gap-1">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white mb-0.5">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-serif font-bold text-xs text-white leading-tight">
                  Instant Recognition
                </span>
                <span className="text-[11px] text-white/65 leading-tight">
                  Visual food detection
                </span>
              </div>

              {/* Item 2: Ingredient Breakdown */}
              <div className="flex flex-col items-start gap-1">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white mb-0.5">
                  <Utensils className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-serif font-bold text-xs text-white leading-tight">
                  Ingredient Ratio
                </span>
                <span className="text-[11px] text-white/65 leading-tight">
                  Detailed breakdown
                </span>
              </div>

              {/* Item 3: Tailored Recipes & Swaps */}
              <div className="flex flex-col items-start gap-1">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white mb-0.5">
                  <Sliders className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-serif font-bold text-xs text-white leading-tight">
                  Tailored Swaps
                </span>
                <span className="text-[11px] text-white/65 leading-tight">
                  Dietary customizations
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual 3D Stage (Unified Single-Source Visual Viewport) */}
          <div className="lg:col-span-6 relative flex flex-col items-center">
            {/* AIRecipeScanner: AI Dish Scanner & Camera Section Viewport */}
            <AIRecipeScanner
              imageSrc={imageSrc}
              isAnalyzing={isAnalyzing}
              analysisStage={analysisStage}
              analysisResult={analysisResult}
              viewportStatus={viewportStatus}
              onStatusChange={onViewportStatusChange}
              onAnalyze={onAnalyze}
              onChangePhoto={onChangePhoto}
              onRemovePhoto={onRemovePhoto}
              onCaptureClick={onCaptureClick}
              onUploadClick={onUploadClick}
              onSelectSample={onSelectSample}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
