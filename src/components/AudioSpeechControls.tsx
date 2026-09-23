import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Headphones,
  Settings,
  Sparkles,
  Check,
  ChevronDown,
} from 'lucide-react';
import { RecipeStep } from '../types';

interface AudioSpeechControlsProps {
  currentStep: RecipeStep;
  totalSteps: number;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  rate: number;
  onSetRate: (rate: number) => void;
  autoReadSteps: boolean;
  onToggleAutoRead: () => void;
  onTogglePlayPause: () => void;
  onReplay: () => void;
  onStop: () => void;
  includeSensoryCue: boolean;
  onToggleSensoryCue: () => void;
  includeIngredients: boolean;
  onToggleIngredients: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onSelectVoice: (voice: SpeechSynthesisVoice | null) => void;
}

export const AudioSpeechControls: React.FC<AudioSpeechControlsProps> = ({
  currentStep,
  totalSteps,
  isSpeaking,
  isPaused,
  isSupported,
  rate,
  onSetRate,
  autoReadSteps,
  onToggleAutoRead,
  onTogglePlayPause,
  onReplay,
  onStop,
  includeSensoryCue,
  onToggleSensoryCue,
  includeIngredients,
  onToggleIngredients,
  voices,
  selectedVoice,
  onSelectVoice,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!isSupported) {
    return null;
  }

  const speedOptions = [0.8, 1.0, 1.2, 1.5];

  return (
    <div className="flex flex-col gap-2.5">
      {/* Primary Audio Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#EDE5DA]/60 border border-[#263A20]/15">
        {/* Left: Play / Pause / Replay Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlayPause}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              isSpeaking && !isPaused
                ? 'bg-[#263A20] text-white ring-2 ring-[#263A20]/20'
                : isPaused
                ? 'bg-amber-800 text-white'
                : 'bg-[#FAF7F0] hover:bg-white text-[#263A20] border border-[#263A20]/20 hover:border-[#263A20]/40'
            }`}
            title={isSpeaking && !isPaused ? 'Pause Speech' : isPaused ? 'Resume Speech' : 'Listen to Step'}
          >
            {isSpeaking && !isPaused ? (
              <>
                {/* Animated Soundwave Visualizer Bars */}
                <div className="flex items-center gap-0.5 h-3.5 w-4 justify-center">
                  <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s] h-3.5" />
                  <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s] h-2.5" />
                  <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:0s] h-3" />
                </div>
                <span>Pause Voice</span>
              </>
            ) : isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#263A20]" />
                <span>Listen to Step</span>
              </>
            )}
          </button>

          {/* Replay Step Button */}
          <button
            type="button"
            onClick={onReplay}
            className="p-2 rounded-full border border-[#263A20]/15 hover:bg-[#FAF7F0] text-[#263A20]/80 hover:text-[#263A20] transition-colors cursor-pointer"
            title="Repeat step instructions from beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Stop Button (only when speaking or paused) */}
          {(isSpeaking || isPaused) && (
            <button
              type="button"
              onClick={onStop}
              className="p-2 rounded-full border border-red-200 hover:bg-red-50 text-red-700 transition-colors cursor-pointer"
              title="Stop speech"
            >
              <VolumeX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Hands-Free Auto-Read & Speed Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hands-Free Auto-Read Switch */}
          <button
            type="button"
            onClick={onToggleAutoRead}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              autoReadSteps
                ? 'bg-[#263A20]/10 border-[#263A20] text-[#263A20] font-semibold'
                : 'bg-[#FAF7F0] border-[#263A20]/15 text-[#263A20]/70 hover:text-[#263A20]'
            }`}
            title="Automatically read step aloud when moving forward or backward"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Hands-Free Auto-Read:</span>
            <span className={`text-[11px] uppercase font-bold ${autoReadSteps ? 'text-[#263A20]' : 'text-[#263A20]/50'}`}>
              {autoReadSteps ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Speed Preset Pills */}
          <div className="hidden sm:flex items-center bg-[#FAF7F0] rounded-full p-0.5 border border-[#263A20]/15">
            {speedOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onSetRate(opt)}
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  rate === opt
                    ? 'bg-[#263A20] text-white font-semibold'
                    : 'text-[#263A20]/70 hover:text-[#263A20]'
                }`}
              >
                {opt}x
              </button>
            ))}
          </div>

          {/* Settings Toggle */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
              isSettingsOpen
                ? 'bg-[#263A20] text-white border-[#263A20]'
                : 'border-[#263A20]/20 hover:bg-[#FAF7F0] text-[#263A20]/80'
            }`}
            title="Voice & Speech Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Voice & Content Settings Panel (Collapsible) */}
      {isSettingsOpen && (
        <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#263A20]/20 shadow-xs space-y-3.5 text-xs text-[#263A20] animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#263A20]/10 pb-2">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#263A20]" />
              Text-to-Speech Preferences
            </h4>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="text-[#263A20]/60 hover:text-[#263A20] font-medium cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Voice Selection */}
            {voices.length > 0 && (
              <div className="space-y-1">
                <label className="font-semibold block text-[11px] uppercase tracking-wide text-[#263A20]/80">
                  Narration Voice
                </label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const found = voices.find((v) => v.name === e.target.value);
                    onSelectVoice(found || null);
                  }}
                  className="w-full bg-[#EDE5DA]/50 border border-[#263A20]/20 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#263A20]"
                >
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Speed selection for mobile */}
            <div className="space-y-1 sm:hidden">
              <label className="font-semibold block text-[11px] uppercase tracking-wide text-[#263A20]/80">
                Speech Speed ({rate}x)
              </label>
              <div className="flex items-center gap-1">
                {speedOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onSetRate(opt)}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium border ${
                      rate === opt
                        ? 'bg-[#263A20] text-white border-[#263A20]'
                        : 'bg-[#EDE5DA]/40 text-[#263A20] border-[#263A20]/15'
                    }`}
                  >
                    {opt}x
                  </button>
                ))}
              </div>
            </div>

            {/* Read Options */}
            <div className="space-y-2">
              <label className="font-semibold block text-[11px] uppercase tracking-wide text-[#263A20]/80">
                Spoken Content
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeSensoryCue}
                    onChange={onToggleSensoryCue}
                    className="rounded border-[#263A20]/30 text-[#263A20] focus:ring-[#263A20]"
                  />
                  <span>Read Chef Visual Indicator & Sensory Cue</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeIngredients}
                    onChange={onToggleIngredients}
                    className="rounded border-[#263A20]/30 text-[#263A20] focus:ring-[#263A20]"
                  />
                  <span>Read Ingredients Required For Step</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
