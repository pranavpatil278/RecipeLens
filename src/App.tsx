import React, { useState, useRef, useCallback } from 'react';
import { ScrollVideoBackground } from './components/ScrollVideoBackground';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CameraCapture } from './components/CameraCapture';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisProgress } from './components/AnalysisProgress';
import { DishResult } from './components/DishResult';
import { RecipeCard } from './components/RecipeCard';
import { CookingMode } from './components/CookingMode';
import { RecipeAssistant } from './components/RecipeAssistant';
import { HowItWorksSection } from './components/HowItWorksSection';
import { AiFeaturesSection } from './components/AiFeaturesSection';
import { FavoritesSection } from './components/FavoritesSection';
import { FeatureBanner } from './components/FeatureBanner';
import { FooterBar } from './components/FooterBar';
import {
  AppState,
  AnalysisResult,
  Recipe,
  RecipePreferences,
  SubstitutionOption,
  Viewport3DStatus,
} from './types';
import { apiClient } from './services/apiClient';
import {
  mockButterChickenAnalysis,
  mockInitialRecipe,
  mockDiscoveryRecipes,
} from './data/mockData';
import {
  sampleButterChickenSvg,
  sampleMatchaLatteSvg,
  sampleTuscanPastaSvg,
} from './data/sampleDishes';
import { Sparkles, X, RotateCcw } from 'lucide-react';
import { ChefLabExperience, ChefLabTransition } from './components/ChefLabExperience';

export default function App() {
  const [appState, setAppState] = useState<AppState>('INITIAL');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isCookingModeOpen, setIsCookingModeOpen] = useState(false);
  const [isGlobalAssistantOpen, setIsGlobalAssistantOpen] = useState(false);
  const [isChefTransitioning, setIsChefTransitioning] = useState(false);
  const [isChefLabOpen, setIsChefLabOpen] = useState(false);
  const [viewportStatus, setViewportStatus] = useState<Viewport3DStatus>('IDLE');

  const activeWorkRef = useRef<HTMLDivElement | null>(null);
  const currentBlobRef = useRef<Blob | null>(null);

  const scrollToActiveWork = () => {
    setTimeout(() => {
      activeWorkRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const scrollToHero = () => {
    window.setTimeout(() => {
      document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  // Open camera scanner directly
  const handleOpenScan = () => {
    setIsUploaderOpen(false);
    setIsCameraOpen(true);
  };

  const handleAskChef = useCallback(() => {
    setIsChefTransitioning(true);
  }, []);

  const handleSelectSavedRecipe = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setAppState('RECIPE_READY');
    scrollToActiveWork();
  };

  const handleToggleRecipeSave = () => {
    if (!currentRecipe) return;
    setSavedRecipes((saved) => {
      const alreadySaved = saved.some((recipe) => recipe.recipeId === currentRecipe.recipeId);
      return alreadySaved
        ? saved.filter((recipe) => recipe.recipeId !== currentRecipe.recipeId)
        : [...saved, currentRecipe];
    });
  };

  const handleChefTransitionComplete = useCallback(() => {
    setIsChefTransitioning(false);
    setIsChefLabOpen(true);
  }, []);

  const handleOpenUpload = () => {
    setIsUploaderOpen(true);
    scrollToActiveWork();
  };

  // Camera capture callback - loads photo into the single 3D Hero stage and optionally auto-analyzes
  const handleCameraCapture = (blob: Blob, dataUrl: string, autoAnalyze: boolean = false) => {
    setCurrentBlob(blob);
    currentBlobRef.current = blob;
    setCurrentImageSrc(dataUrl);
    setAnalysisResult(null);
    setCurrentRecipe(null);
    setIsCameraOpen(false);
    setAppState('IMAGE_PREVIEW');
    scrollToHero();
    if (autoAnalyze) {
      setTimeout(() => {
        handleStartAnalysis();
      }, 120);
    }
  };

  // File upload callback - loads photo into the single 3D Hero stage
  const handleImageSelected = (file: File, dataUrl: string) => {
    setCurrentBlob(file);
    currentBlobRef.current = file;
    setCurrentImageSrc(dataUrl);
    setAnalysisResult(null);
    setCurrentRecipe(null);
    setIsUploaderOpen(false);
    setAppState('IMAGE_PREVIEW');
    // The upload drawer is below the hero. Return to the newly loaded photo
    // before that drawer is unmounted so browser scroll anchoring cannot jump
    // to the next section ("How It Works").
    scrollToHero();
  };

  // Sample selector directly inside 3D Hero stage
  const handleSelectSample = (sampleKey: string) => {
    if (sampleKey === 'butter_chicken') {
      setCurrentImageSrc(sampleButterChickenSvg);
      setAnalysisResult(mockButterChickenAnalysis);
      setCurrentRecipe(mockInitialRecipe);
      setAppState('IMAGE_PREVIEW');
    } else if (sampleKey === 'matcha_latte') {
      setCurrentImageSrc(sampleMatchaLatteSvg);
      setAnalysisResult({
        ...mockButterChickenAnalysis,
        dishName: 'Ceremonial Matcha Boba Latte',
        cuisine: 'Modern Japanese',
        difficulty: 'Easy',
        prepTimeMinutes: 10,
        cookTimeMinutes: 5,
        servings: 2,
        detectedIngredients: [
          'Ceremonial Uji Matcha Powder',
          'Steamed Oat Milk',
          'Brown Sugar Tapioca Pearls',
          'Agave Nectar',
        ],
      });
      setCurrentRecipe({
        ...mockInitialRecipe,
        title: 'Ceremonial Matcha Boba Latte',
        cuisine: 'Modern Japanese',
        difficulty: 'Easy',
        prepTimeMinutes: 10,
        cookTimeMinutes: 5,
        servings: 2,
        ingredients: [
          { id: 'm1', name: 'Ceremonial Grade Matcha Powder', quantity: '2', unit: 'tsp', category: 'pantry' },
          { id: 'm2', name: 'Hot Filtered Water (80°C)', quantity: '60', unit: 'ml', category: 'pantry' },
          { id: 'm3', name: 'Steamed Barista Oat Milk', quantity: '200', unit: 'ml', category: 'dairy' },
          { id: 'm4', name: 'Cooked Boba Tapioca Pearls', quantity: '4', unit: 'tbsp', category: 'pantry' },
        ],
      });
      setAppState('IMAGE_PREVIEW');
    } else if (sampleKey === 'tuscan_pasta') {
      setCurrentImageSrc(sampleTuscanPastaSvg);
      setAnalysisResult({
        ...mockButterChickenAnalysis,
        dishName: 'Creamy Tuscan Sun-Dried Tomato Rigatoni',
        cuisine: 'Italian Contemporary',
        difficulty: 'Easy',
        prepTimeMinutes: 10,
        cookTimeMinutes: 15,
        servings: 4,
        detectedIngredients: [
          'Artisan Rigatoni Pasta',
          'Sun-Dried Tomatoes in Olive Oil',
          'Baby Spinach Leaves',
          'Heavy Cream & Fresh Garlic',
          'Aged Parmigiano-Reggiano',
        ],
      });
      setCurrentRecipe({
        ...mockInitialRecipe,
        title: 'Creamy Tuscan Sun-Dried Tomato Rigatoni',
        cuisine: 'Italian Contemporary',
        difficulty: 'Easy',
        prepTimeMinutes: 10,
        cookTimeMinutes: 15,
        servings: 4,
      });
      setAppState('IMAGE_PREVIEW');
    }
  };

  // Trigger dish analysis pipeline directly from 3D stage or Hero CTA
  const handleStartAnalysis = async () => {
    if (!currentBlobRef.current) {
      setAnalysisError('Please upload or capture a food photo before starting analysis.');
      return;
    }
    setAnalysisError(null);
    setAppState('ANALYZING');
    setAnalysisStage('Multimodal 3D Vision Scanning...');
    scrollToActiveWork();

    try {
      const result = await apiClient.analyzeDishImage(currentBlobRef.current);
      setAnalysisResult(result);
      const recipe = await apiClient.generateRecipe(result.analysisId);
      setCurrentRecipe(recipe);
      setAppState('ANALYSIS_COMPLETE');
      scrollToActiveWork();
    } catch (error) {
      setAnalysisError(
        error instanceof Error
          ? error.message
          : 'We could not analyze this photo. Please try another image.',
      );
      setAppState('IMAGE_PREVIEW');
      scrollToActiveWork();
    }
  };

  // Move from DishResult to RecipeCard
  const handleProceedToRecipe = () => {
    setAppState('RECIPE_READY');
    scrollToActiveWork();
  };

  // Switch alternative dish
  const handleSelectAlternativeDish = async (dishName: string) => {
    if (analysisResult) {
      const updatedAnalysis: AnalysisResult = {
        ...analysisResult,
        dishName,
      };
      setAnalysisResult(updatedAnalysis);
      if (currentRecipe) {
        setCurrentRecipe({
          ...currentRecipe,
          title: `Velvety ${dishName}`,
        });
      }
    }
  };

  // Update recipe preferences from RecipeCustomizer
  const handleUpdatePreferences = async (prefs: RecipePreferences) => {
    if (!analysisResult) return;
    try {
      const updated = await apiClient.generateRecipe(analysisResult.analysisId, prefs);
      setCurrentRecipe({
        ...updated,
        spiceLevel: prefs.spiceLevel,
        dietaryTags: Array.from(new Set([...updated.dietaryTags, ...prefs.dietaryConstraints])),
      });
    } catch {
      // ignore
    }
  };

  // Apply ingredient substitution from SubstitutionPanel
  const handleApplySubstitution = (ingredientId: string, sub: SubstitutionOption) => {
    if (!currentRecipe) return;
    const updatedIngredients = currentRecipe.ingredients.map((ing) => {
      if (ing.id === ingredientId) {
        return {
          ...ing,
          name: sub.substituteName,
          originalName: ing.name,
          substituted: true,
          note: `${sub.reason} (${sub.ratio})`,
        };
      }
      return ing;
    });

    setCurrentRecipe({
      ...currentRecipe,
      ingredients: updatedIngredients,
    });
  };

  // When clicking a recipe in Favorites/Discover
  const handleSelectDiscoveryRecipe = (title: string) => {
    const matchingDisc = mockDiscoveryRecipes.find(
      (d) => d.title.toLowerCase() === title.toLowerCase()
    );
    if (matchingDisc?.imageUrl) {
      setCurrentImageSrc(matchingDisc.imageUrl);
    } else if (title.toLowerCase().includes('matcha')) {
      setCurrentImageSrc(sampleMatchaLatteSvg);
    } else if (title.toLowerCase().includes('pasta') || title.toLowerCase().includes('tuscan')) {
      setCurrentImageSrc(sampleTuscanPastaSvg);
    } else {
      setCurrentImageSrc(sampleButterChickenSvg);
    }

    setAnalysisResult({
      ...mockButterChickenAnalysis,
      dishName: title,
    });
    setCurrentRecipe({
      ...mockInitialRecipe,
      title: title,
    });
    setAppState('RECIPE_READY');
    scrollToActiveWork();
  };

  const handleResetActiveFlow = () => {
    setAppState('INITIAL');
    setCurrentImageSrc(null);
    setCurrentBlob(null);
    currentBlobRef.current = null;
    setAnalysisError(null);
    setIsUploaderOpen(false);
    setViewportStatus('IDLE');
  };

  return (
    <div className="min-h-screen bg-transparent text-[#FAF7F0] selection:bg-[#263A20]/20 flex flex-col font-sans antialiased">
      {/* Scroll-driven cinematic video background */}
      <ScrollVideoBackground />
      {/* Navigation Header */}
      <Header
        onScanClick={handleOpenScan}
        onAskChef={handleAskChef}
        savedRecipes={savedRecipes}
        onSelectSavedRecipe={handleSelectSavedRecipe}
      />

      {/* Main Content Flow */}
      <main className="flex-1 w-full">
        {/* Unified Hero Section with Single-Source 3D Culinary Stage */}
        <HeroSection
          onCaptureClick={handleOpenScan}
          onUploadClick={handleOpenUpload}
          imageSrc={currentImageSrc}
          isAnalyzing={appState === 'ANALYZING'}
          analysisStage={analysisStage}
          analysisResult={analysisResult}
          viewportStatus={viewportStatus}
          onViewportStatusChange={setViewportStatus}
          onAnalyze={handleStartAnalysis}
          onChangePhoto={handleOpenUpload}
          onRemovePhoto={handleResetActiveFlow}
          onSelectSample={handleSelectSample}
        />

        {/* WORKSPACE & STAGE TRANSITIONS */}
        <div ref={activeWorkRef} className="w-full">
          {/* File Uploader Dropzone Drawer (Only when explicitly open) */}
          {isUploaderOpen && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#263A20]">
                  Select Food Photograph
                </span>
                <button
                  type="button"
                  onClick={() => setIsUploaderOpen(false)}
                  className="text-xs text-[#263A20]/60 hover:text-[#263A20] flex items-center gap-1 font-medium cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
              <ImageUploader
                onImageSelected={handleImageSelected}
              />
            </div>
          )}

          {/* State: ANALYZING Progress Bar (The 3D stage concurrently displays the 3D laser sweep) */}
          {appState === 'ANALYZING' && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
              <AnalysisProgress onComplete={() => undefined} />
            </div>
          )}

          {analysisError && (
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6" role="alert">
              <div className="rounded-2xl border border-rose-300 bg-rose-50/95 p-4 text-sm text-rose-900 shadow-sm">
                {analysisError}
              </div>
            </div>
          )}

          {/* State: ANALYSIS_COMPLETE (No duplicate photo! Focuses purely on culinary intelligence) */}
          {appState === 'ANALYSIS_COMPLETE' && analysisResult && (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-xs text-[#263A20]/75">
                  <Sparkles className="w-3.5 h-3.5 text-[#263A20]" />
                  <span>Inspected in 3D viewport above</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetActiveFlow}
                  className="text-xs text-[#263A20]/60 hover:text-[#263A20] flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Start New Scan
                </button>
              </div>
              <DishResult
                result={analysisResult}
                onProceedToRecipe={handleProceedToRecipe}
                onSelectAlternativeDish={handleSelectAlternativeDish}
              />
            </div>
          )}

          {/* State: RECIPE_READY (Detailed recipe, ingredient scaler, dietary swaps, cooking mode) */}
          {appState === 'RECIPE_READY' && currentRecipe && (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
              <div className="flex justify-between items-center mb-3">
                <button
                  type="button"
                  onClick={() => setAppState('ANALYSIS_COMPLETE')}
                  className="text-xs text-[#263A20]/75 hover:text-[#263A20] font-medium cursor-pointer"
                >
                  ← Back to Analysis Result
                </button>
                <button
                  type="button"
                  onClick={handleResetActiveFlow}
                  className="text-xs text-[#263A20]/60 hover:text-[#263A20] flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Start New Scan
                </button>
              </div>
              <RecipeCard
                recipe={currentRecipe}
                onStartCooking={() => setIsCookingModeOpen(true)}
                onUpdatePreferences={handleUpdatePreferences}
                onApplySubstitution={handleApplySubstitution}
                isSaved={savedRecipes.some((recipe) => recipe.recipeId === currentRecipe.recipeId)}
                onToggleSave={handleToggleRecipeSave}
              />
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <HowItWorksSection onScanClick={handleOpenScan} />

        {/* AI Features Section */}
        <AiFeaturesSection />

        {/* Community Recipe Discovery Section (Re-uses original 4-column card styling) */}
        <FavoritesSection onSelectRecipe={handleSelectDiscoveryRecipe} />

        {/* Feature / Promotional Banner */}
        <FeatureBanner onStartClick={scrollToHero} />
      </main>

      {/* Footer */}
      <FooterBar />

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setIsCameraOpen(false)}
          onSwitchToUpload={() => {
            setIsCameraOpen(false);
            setIsUploaderOpen(true);
            scrollToActiveWork();
          }}
        />
      )}

      {/* Cooking Mode Full-Screen Interface */}
      {isCookingModeOpen && currentRecipe && (
        <CookingMode
          recipe={currentRecipe}
          onExit={() => setIsCookingModeOpen(false)}
        />
      )}

      {/* Contextual Assistant Modal */}
      {currentRecipe && (
        <RecipeAssistant
          recipe={currentRecipe}
          isOpen={isGlobalAssistantOpen}
          onClose={() => setIsGlobalAssistantOpen(false)}
        />
      )}

      {isChefTransitioning && <ChefLabTransition onComplete={handleChefTransitionComplete} />}
      {isChefLabOpen && <ChefLabExperience onClose={() => setIsChefLabOpen(false)} />}
    </div>
  );
}
