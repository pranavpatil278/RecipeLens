import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Recipe } from '../types';
import { CookingTimer } from './CookingTimer';
import { RecipeAssistant } from './RecipeAssistant';
import { AudioSpeechControls } from './AudioSpeechControls';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  X,
  ChefHat,
  Check,
  Eye,
  Volume2,
  VolumeX,
  Headphones,
  RotateCcw,
} from 'lucide-react';

interface CookingModeProps {
  recipe: Recipe;
  onExit: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipe, onExit }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Text-To-Speech Engine Integration
  const {
    isSupported,
    isSpeaking,
    isPaused,
    rate,
    setRate,
    voices,
    selectedVoice,
    setSelectedVoice,
    autoReadSteps,
    toggleAutoRead,
    includeSensoryCue,
    setIncludeSensoryCue,
    includeIngredients,
    setIncludeIngredients,
    speakStep,
    togglePlayPauseStep,
    pause,
    resume,
    stop,
  } = useTextToSpeech();

  const totalSteps = recipe.steps.length;
  const currentStep = recipe.steps[currentStepIndex];
  const isFirstRender = useRef(true);

  // Auto-read step when step changes if hands-free autoReadSteps is enabled
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (autoReadSteps) {
        speakStep(currentStep, totalSteps);
      }
      return;
    }

    if (autoReadSteps) {
      speakStep(currentStep, totalSteps);
    } else {
      // If user was manually listening and navigated to next step, stop previous audio
      stop();
    }
  }, [currentStepIndex, autoReadSteps, speakStep, stop, currentStep, totalSteps]);

  const handleNext = useCallback(() => {
    if (!completedSteps.includes(currentStepIndex)) {
      setCompletedSteps((prev) => [...prev, currentStepIndex]);
    }
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [completedSteps, currentStepIndex, totalSteps]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const handleReplayCurrentStep = useCallback(() => {
    speakStep(currentStep, totalSteps);
  }, [speakStep, currentStep, totalSteps]);

  const handleTogglePlayPause = useCallback(() => {
    togglePlayPauseStep(currentStep, totalSteps);
  }, [togglePlayPauseStep, currentStep, totalSteps]);

  // Hands-free Kitchen Keyboard Shortcuts:
  // Space: Play/Pause step narration
  // ArrowRight: Next Step
  // ArrowLeft: Prev Step
  // 'R': Repeat current step
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in assistant input or any input/textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReplayCurrentStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleTogglePlayPause, handleNext, handlePrev, handleReplayCurrentStep]);

  // Cleanup speech when exiting Cooking Mode
  const handleExitCookingMode = () => {
    stop();
    onExit();
  };

  const isLastStep = currentStepIndex === totalSteps - 1;
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div
      role="region"
      aria-label="Cooking Mode Step-by-step Guide"
      className="fixed inset-0 z-40 bg-[#FAF7F0] overflow-y-auto flex flex-col justify-between"
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FAF7F0]/95 backdrop-blur-xs border-b border-[#263A20]/12 px-4 sm:px-8 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleExitCookingMode}
            className="flex items-center gap-2 text-xs font-medium text-[#263A20] hover:text-[#1C2C17] py-1.5 px-3 rounded-full border border-[#263A20]/20 hover:bg-[#263A20]/5 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#263A20] shrink-0" />
            <span className="font-serif font-bold text-xs sm:text-sm text-[#263A20] truncate max-w-xs">
              {recipe.title}
            </span>
          </div>
        </div>

        {/* Center/Right: Audio Status Pill & Assistant Button */}
        <div className="flex items-center gap-2">
          {/* Quick Hands-free Audio Indicator */}
          {isSupported && (
            <button
              type="button"
              onClick={handleTogglePlayPause}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                isSpeaking && !isPaused
                  ? 'bg-[#263A20] text-white border-[#263A20] shadow-xs'
                  : isPaused
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : autoReadSteps
                  ? 'bg-[#263A20]/10 text-[#263A20] border-[#263A20]/20'
                  : 'bg-[#FAF7F0] text-[#263A20]/75 border-[#263A20]/20 hover:text-[#263A20]'
              }`}
              title={
                isSpeaking && !isPaused
                  ? 'Audio Playing - Click to Pause (or press Space)'
                  : isPaused
                  ? 'Audio Paused - Click to Resume'
                  : autoReadSteps
                  ? 'Hands-Free Auto-Read is Active'
                  : 'Click to Listen to this Step'
              }
            >
              {isSpeaking && !isPaused ? (
                <>
                  <div className="flex items-center gap-0.5 h-3 w-3 justify-center">
                    <span className="w-0.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                    <span className="w-0.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s] h-2" />
                    <span className="w-0.5 bg-white rounded-full animate-bounce [animation-delay:0s] h-2.5" />
                  </div>
                  <span className="text-[11px] font-semibold hidden sm:inline">Speaking</span>
                </>
              ) : isPaused ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold hidden sm:inline">Paused</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">
                    {autoReadSteps ? 'Auto-Read' : 'Listen'}
                  </span>
                </>
              )}
            </button>
          )}

          {/* Ask RecipeLens Button */}
          <button
            type="button"
            onClick={() => setIsAssistantOpen(true)}
            className="bg-[#263A20] hover:bg-[#1C2C17] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-medium shadow-xs transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A3B89D]" />
            <span>Ask Chef</span>
          </button>
        </div>
      </header>

      {/* Progress Line */}
      <div className="w-full bg-[#EDE5DA] h-1.5">
        <div
          className="bg-[#263A20] h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Focus Screen */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-5 sm:py-8 flex flex-col justify-center space-y-5 sm:space-y-6">
        {/* Step Counter Badge & Completion */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#263A20]/10 text-[#263A20] text-xs font-bold tracking-widest uppercase">
            <ChefHat className="w-3.5 h-3.5" />
            STEP {currentStepIndex + 1} OF {totalSteps}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#263A20]/60 font-medium">
              {Math.round(progressPercent)}% Completed
            </span>
          </div>
        </div>

        {/* Text-to-Speech Interactive Kitchen Controls */}
        <AudioSpeechControls
          currentStep={currentStep}
          totalSteps={totalSteps}
          isSpeaking={isSpeaking}
          isPaused={isPaused}
          isSupported={isSupported}
          rate={rate}
          onSetRate={setRate}
          autoReadSteps={autoReadSteps}
          onToggleAutoRead={toggleAutoRead}
          onTogglePlayPause={handleTogglePlayPause}
          onReplay={handleReplayCurrentStep}
          onStop={stop}
          includeSensoryCue={includeSensoryCue}
          onToggleSensoryCue={() => setIncludeSensoryCue((p) => !p)}
          includeIngredients={includeIngredients}
          onToggleIngredients={() => setIncludeIngredients((p) => !p)}
          voices={voices}
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
        />

        {/* DOMINANT INSTRUCTION (With visual reading highlight when audio is actively speaking) */}
        <div
          className={`space-y-4 p-4 sm:p-6 rounded-3xl transition-all duration-300 ${
            isSpeaking && !isPaused
              ? 'bg-[#EDE5DA]/70 border-2 border-[#263A20]/30 shadow-xs'
              : 'bg-transparent border border-transparent'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#263A20] leading-tight sm:leading-snug flex-1">
              {currentStep.instruction}
            </h2>

            {/* Quick in-place speech trigger */}
            <button
              type="button"
              onClick={handleTogglePlayPause}
              className={`p-2.5 rounded-full shrink-0 transition-colors cursor-pointer border ${
                isSpeaking && !isPaused
                  ? 'bg-[#263A20] text-white border-[#263A20]'
                  : 'bg-[#FAF7F0] hover:bg-[#EDE5DA] text-[#263A20] border-[#263A20]/20'
              }`}
              title={isSpeaking && !isPaused ? 'Pause Voice' : 'Read this step aloud'}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Sensory Cue / Chef Tip */}
          {currentStep.sensoryCue && (
            <div className="p-3.5 rounded-2xl bg-[#EDE5DA]/70 border border-[#263A20]/15 flex items-start gap-2.5 text-xs text-[#263A20]/80">
              <Eye className="w-4 h-4 text-[#263A20] shrink-0 mt-0.5" />
              <p>
                <strong className="font-semibold text-[#263A20]">Visual Indicator: </strong>
                {currentStep.sensoryCue}
              </p>
            </div>
          )}
        </div>

        {/* Current Step Ingredients List */}
        {currentStep.ingredients && currentStep.ingredients.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#EDE5DA]/50 border border-[#263A20]/15 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#263A20]">
              Current Ingredients Needed For This Step:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentStep.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF7F0] p-2.5 rounded-xl border border-[#263A20]/10 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-[#263A20]">{ing.name}</span>
                  <span className="font-bold text-[#263A20]">{ing.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integrated Step Timer if step has duration */}
        {currentStep.timerSeconds && currentStep.timerSeconds > 0 && (
          <CookingTimer
            key={`step_timer_${currentStepIndex}`}
            initialSeconds={currentStep.timerSeconds}
            label={`Step ${currentStepIndex + 1} Duration`}
          />
        )}
      </main>

      {/* Persistent Bottom Action Bar */}
      <footer className="sticky bottom-0 bg-[#FAF7F0]/95 backdrop-blur-xs border-t border-[#263A20]/12 px-4 sm:px-8 py-3.5 sm:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="border border-[#263A20]/30 hover:border-[#263A20] disabled:opacity-35 text-[#263A20] px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Stepper Dots (Desktop) & Kitchen Shortcuts Info */}
          <div className="flex flex-col items-center gap-1">
            <div className="hidden sm:flex items-center gap-1.5">
              {recipe.steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStepIndex
                      ? 'w-6 bg-[#263A20]'
                      : completedSteps.includes(idx)
                      ? 'w-2 bg-[#263A20]/60'
                      : 'w-2 bg-[#263A20]/20'
                  }`}
                  aria-label={`Jump to step ${idx + 1}`}
                />
              ))}
            </div>

            <span className="text-[10px] text-[#263A20]/50 hidden md:block">
              Hands-free: [Space] Voice • [→] Next • [R] Replay
            </span>
          </div>

          <button
            type="button"
            onClick={isLastStep ? handleExitCookingMode : handleNext}
            className="bg-[#263A20] hover:bg-[#1C2C17] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium shadow-xs transition-all cursor-pointer flex items-center gap-2"
          >
            {isLastStep ? (
              <>
                <Check className="w-4 h-4 text-[#A3B89D]" />
                <span>Finish & Plate</span>
              </>
            ) : (
              <>
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </footer>

      {/* Contextual Assistant Modal */}
      <RecipeAssistant
        recipe={recipe}
        currentStep={currentStepIndex + 1}
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
};

