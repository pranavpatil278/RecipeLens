import React, { useState, useRef } from 'react';
import { DiscoveryRecipe } from '../types';
import { apiClient } from '../services/apiClient';
import freshProducePantryImg from '../assets/images/fresh_produce_pantry_1789653776675.jpg';
import pantryAvocadoEggImg from '../assets/images/pantry_avocado_egg_1789653800261.jpg';
import {
  Sparkles,
  Upload,
  ChefHat,
  ArrowRight,
  Clock,
  UtensilsCrossed,
  RefreshCw,
  X,
  Check,
  ScanLine,
  Layers,
} from 'lucide-react';

interface IngredientRecipeFinderProps {
  onSelectRecipeTitle: (recipeTitle: string) => void;
}

const VIRTUAL_PANTRY_ITEMS = [
  {
    key: 'tomato',
    name: 'Fresh Vine Tomatoes & Basil',
    image: freshProducePantryImg,
    category: 'Fresh Produce',
    label: '🍅 Vine Tomatoes',
  },
  {
    key: 'avocado',
    name: 'Hass Avocado & Farm Eggs',
    image: pantryAvocadoEggImg,
    category: 'Produce & Dairy',
    label: '🥑 Avocado & Eggs',
  },
];

export const IngredientRecipeFinder: React.FC<IngredientRecipeFinderProps> = ({
  onSelectRecipeTitle,
}) => {
  const [mode, setMode] = useState<'upload' | 'idle'>('idle');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{ dataUrl: string; fileName: string } | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Result state
  const [detectedIngredient, setDetectedIngredient] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(96);
  const [pairings, setPairings] = useState<string[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<DiscoveryRecipe[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Quick sample shortcuts for instant testing
  const samplePantryItems = [
    { label: 'Hass Avocado', key: 'avocado' },
    { label: 'Vine Tomatoes', key: 'tomato' },
  ];

  const handleScanPendingImage = () => {
    if (pendingImage) {
      void processIngredientImage(pendingImage.dataUrl);
      return;
    }
  };

  const handleOpenPantryUpload = () => {
    setMode('upload');
  };

  // Process uploaded file
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setPhotoPreview(dataUrl);
        setPendingImage({ dataUrl, fileName: file.name });
        setDetectedIngredient(null);
        setSuggestedRecipes([]);
        setPairings([]);
        setAnalysisError(null);
        setMode('idle');
      }
    };
    reader.readAsDataURL(file);
  };

  // Execute ingredient recognition & recipe matching pipeline
  const processIngredientImage = async (imageInput: string) => {
    setAnalyzing(true);
    setMode('idle');
    setPendingImage(null);
    setAnalysisError(null);
    setAnalysisStage('Analyzing ingredient texture & characteristics...');

    setTimeout(() => {
      setAnalysisStage('Classifying culinary taxonomy & flavor profile...');
    }, 400);

    setTimeout(() => {
      setAnalysisStage('Finding chef-tested recipes using this item...');
    }, 700);

    try {
      const res = await apiClient.discoverByIngredient(imageInput);
      setDetectedIngredient(res.detectedIngredient);
      setCategory(res.category);
      setConfidence(res.confidence);
      setPairings(res.pairings);
      setSuggestedRecipes(res.recipes);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'We could not identify this pantry item.');
    } finally {
      setAnalyzing(false);
      setAnalysisStage('');
    }
  };

  // Quick sample selection
  const handleSampleClick = (key: string) => {
    const sample = VIRTUAL_PANTRY_ITEMS.find((item) => item.key === key);
    if (!sample) return;
    setPhotoPreview(sample.image);
    processIngredientImage(sample.image);
  };

  const handleReset = () => {
    setMode('idle');
    setPhotoPreview(null);
    setPendingImage(null);
    setAnalysisError(null);
    setDetectedIngredient(null);
    setSuggestedRecipes([]);
    setPairings([]);
  };

  return (
    <div
      id="ingredient-recipe-finder"
      className="w-full bg-[#FAF7F0] border border-[#263A20]/15 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
          }
        }}
        className="hidden"
      />
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#263A20]/10 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#263A20]/10 text-[#263A20] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#263A20]" />
            Pantry & Produce Discovery
          </div>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#263A20]">
            Ingredient-to-Recipe Finder
          </h3>
          <p className="text-xs sm:text-sm text-[#263A20]/70">
            Photograph or upload any ingredient in your fridge or pantry to find recipes you can cook with it right now.
          </p>
        </div>

        {/* Upload trigger */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleOpenPantryUpload}
            className="bg-[#263A20] hover:bg-[#1C2C17] text-white px-4 py-2.5 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-[#A3B89D]" />
            <span>Upload Pantry Image</span>
          </button>
        </div>
      </div>

      {/* Quick Sample Selector Bar */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-[#263A20]/75">
        <span className="font-semibold text-[#263A20]">Quick Sample Ingredients:</span>
        {samplePantryItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => handleSampleClick(item.key)}
            className="px-3 py-1 rounded-full border border-[#263A20]/20 bg-[#EDE5DA]/50 hover:bg-[#EDE5DA] text-[#263A20] font-medium transition-colors cursor-pointer text-xs"
          >
            {item.label}
          </button>
        ))}
      </div>

      {pendingImage && !analyzing && !detectedIngredient && (
        <div className="bg-[#EDE5DA]/70 border border-[#263A20]/15 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in duration-200">
          <img
            src={pendingImage.dataUrl}
            alt="Uploaded pantry item"
            className="w-20 h-20 rounded-xl object-cover border border-[#263A20]/15"
          />
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-serif font-bold text-base text-[#263A20]">Pantry photo ready</h4>
            <p className="text-xs text-[#263A20]/70">Click Scan Pantry Item when you are ready for Gemini to identify it.</p>
          </div>
          <button
            type="button"
            onClick={handleScanPendingImage}
            className="bg-[#263A20] hover:bg-[#1C2C17] text-white px-4 py-2.5 rounded-full text-xs font-semibold cursor-pointer flex items-center gap-2"
          >
            <ScanLine className="w-3.5 h-3.5 text-[#A3B89D]" />
            Scan Pantry Item
          </button>
        </div>
      )}

      {/* UPLOAD INTERFACE */}
      {mode === 'upload' && (
        <div className="bg-[#EDE5DA]/60 border-2 border-dashed border-[#263A20]/25 rounded-3xl p-8 sm:p-10 text-center relative animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setMode('idle')}
            className="absolute top-4 right-4 p-1 rounded-full border border-[#263A20]/20 text-[#263A20] hover:bg-[#263A20]/5 transition-colors cursor-pointer"
            aria-label="Close upload"
          >
            <X className="w-4 h-4" />
          </button>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center cursor-pointer p-4 rounded-2xl transition-all ${
              isDragging ? 'bg-[#263A20]/10 border border-[#263A20]' : ''
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-[#263A20]/10 flex items-center justify-center text-[#263A20] mb-3">
              <Upload className="w-6 h-6 stroke-[1.75]" />
            </div>

            <h4 className="font-serif font-bold text-base text-[#263A20] mb-1">
              Select or Drop an Ingredient Photo
            </h4>
            <p className="text-xs text-[#263A20]/65 max-w-sm mb-4">
              Take a snapshot of any vegetable, spice, dairy product, protein, or pantry staple.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="bg-[#263A20] hover:bg-[#1C2C17] text-white px-5 py-2.5 rounded-full text-xs font-medium shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5 text-[#A3B89D]" />
                Browse Device
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ANALYZING LOADING STATE */}
      {analyzing && (
        <div className="bg-[#EDE5DA]/70 border border-[#263A20]/15 rounded-2xl p-8 text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-full bg-[#263A20] text-white flex items-center justify-center mx-auto shadow-md animate-spin">
            <RefreshCw className="w-5 h-5 text-[#A3B89D]" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-base text-[#263A20]">
              Ingredient Vision Scanning
            </h4>
            <p className="text-xs text-[#263A20]/75">{analysisStage}</p>
          </div>
        </div>
      )}

      {analysisError && !analyzing && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-900" role="alert">
          {analysisError}
        </div>
      )}

      {/* RECOGNIZED INGREDIENT & RECIPE DISCOVERY RESULTS */}
      {!analyzing && detectedIngredient && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Identified Item Card */}
          <div className="bg-[#EDE5DA]/80 border border-[#263A20]/15 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#263A20]/20 shrink-0 bg-black">
                  <img
                    src={photoPreview}
                    alt={detectedIngredient}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#263A20] text-white flex items-center justify-center font-serif font-bold text-base shrink-0 shadow-xs">
                  ✓
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#263A20] bg-[#FAF7F0] px-2.5 py-0.5 rounded-full border border-[#263A20]/15">
                    {category || 'Identified Ingredient'}
                  </span>
                  <span className="text-[11px] font-semibold text-[#263A20] bg-[#263A20]/10 px-2 py-0.5 rounded-full">
                    {confidence}% Match
                  </span>
                </div>
                <h4 className="font-serif font-bold text-lg sm:text-xl text-[#263A20]">
                  {detectedIngredient}
                </h4>
                {pairings.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[11px] text-[#263A20]/65 font-medium">
                      Best Pairings:
                    </span>
                    {pairings.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] text-[#263A20] bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-[#263A20]/10"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-[#263A20]/75 hover:text-[#263A20] underline font-medium cursor-pointer"
              >
                Scan Another Item
              </button>
            </div>
          </div>

          {/* Suggested Recipes Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-base text-[#263A20] flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-[#263A20]" />
              Recipes Featuring {detectedIngredient} ({suggestedRecipes.length})
            </h4>
            <span className="text-[11px] text-[#263A20]/60">
              Click to load recipe into cooking mode
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {suggestedRecipes.map((rec) => (
              <div
                key={rec.id}
                className="bg-[#FAF7F0] border border-[#263A20]/15 hover:border-[#263A20]/45 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-sm group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#263A20] bg-[#263A20]/10 px-2 py-0.5 rounded-md">
                      {rec.category}
                    </span>
                    {rec.matchScore && (
                      <span className="text-[10px] text-[#263A20] font-bold bg-[#FAF7F0] px-2 py-0.5 rounded-full border border-[#263A20]/20">
                        {rec.matchScore}
                      </span>
                    )}
                  </div>

                  <h5 className="font-serif font-bold text-base text-[#263A20] leading-snug group-hover:text-[#1C2C17]">
                    {rec.title}
                  </h5>

                  <div className="flex items-center gap-3 text-xs text-[#263A20]/65">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {rec.prepTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <UtensilsCrossed className="w-3 h-3" />
                      {rec.difficulty}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#263A20]/10">
                  <button
                    type="button"
                    onClick={() => onSelectRecipeTitle(rec.title)}
                    className="w-full bg-[#263A20] hover:bg-[#1C2C17] text-white py-2 px-3 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer group-hover:shadow-xs"
                  >
                    <ChefHat className="w-3.5 h-3.5 text-[#A3B89D]" />
                    <span>Cook This Recipe</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
