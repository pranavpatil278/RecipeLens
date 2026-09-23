import { RecipeStep } from '../types';

export interface TTSVoiceOption {
  voice: SpeechSynthesisVoice;
  displayName: string;
  lang: string;
}

export interface SpeechFormatOptions {
  includeStepNumber?: boolean;
  includeSensoryCue?: boolean;
  includeIngredients?: boolean;
}

/**
 * Cleanly format a recipe step into natural spoken speech for kitchen hands-free cooking.
 */
export function formatStepForSpeech(
  step: RecipeStep,
  totalSteps?: number,
  options: SpeechFormatOptions = {
    includeStepNumber: true,
    includeSensoryCue: true,
    includeIngredients: false,
  }
): string {
  const parts: string[] = [];

  if (options.includeStepNumber) {
    if (totalSteps) {
      parts.push(`Step ${step.stepNumber} of ${totalSteps}.`);
    } else {
      parts.push(`Step ${step.stepNumber}.`);
    }
  }

  // Main instruction text (strip markdown if any)
  const cleanInstruction = step.instruction.replace(/[*_#`]/g, '').trim();
  parts.push(cleanInstruction);

  // Optional: Read ingredients needed for this specific step
  if (options.includeIngredients && step.ingredients && step.ingredients.length > 0) {
    const ingredientsList = step.ingredients
      .map((ing) => `${ing.quantity} ${ing.name}`)
      .join(', ');
    parts.push(`Ingredients for this step: ${ingredientsList}.`);
  }

  // Sensory visual cue / chef tip
  if (options.includeSensoryCue && step.sensoryCue) {
    const cleanCue = step.sensoryCue.replace(/[*_#`]/g, '').trim();
    parts.push(`Visual indicator: ${cleanCue}.`);
  }

  // Duration cue if timer exists
  if (step.timerSeconds && step.timerSeconds > 0) {
    const minutes = Math.floor(step.timerSeconds / 60);
    const seconds = step.timerSeconds % 60;
    if (minutes > 0 && seconds > 0) {
      parts.push(`This step takes approximately ${minutes} minutes and ${seconds} seconds.`);
    } else if (minutes > 0) {
      parts.push(`This step takes approximately ${minutes} minute${minutes > 1 ? 's' : ''}.`);
    } else {
      parts.push(`This step takes ${seconds} seconds.`);
    }
  }

  return parts.join(' ');
}

/**
 * Text-to-Speech Engine Manager utilizing Web Speech API
 */
class TextToSpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private rate: number = 1.0;
  private pitch: number = 1.0;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const available = this.synth.getVoices();
    this.voices = available;

    // Pick best default natural English voice
    if (!this.selectedVoice && this.voices.length > 0) {
      const preferred = this.voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Karen') ||
            v.name.includes('Daniel') ||
            v.name.includes('Arthur'))
      );
      const anyEnglish = this.voices.find((v) => v.lang.startsWith('en'));
      this.selectedVoice = preferred || anyEnglish || this.voices[0];
    }
    this.notify();
  }

  public isSupported(): boolean {
    return this.synth !== null;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter((v) => v.lang.startsWith('en'));
  }

  public getSelectedVoice(): SpeechSynthesisVoice | null {
    return this.selectedVoice;
  }

  public setSelectedVoice(voice: SpeechSynthesisVoice | null) {
    this.selectedVoice = voice;
    this.notify();
  }

  public getRate(): number {
    return this.rate;
  }

  public setRate(rate: number) {
    this.rate = Math.max(0.5, Math.min(2.0, rate));
    this.notify();
  }

  public getPitch(): number {
    return this.pitch;
  }

  public setPitch(pitch: number) {
    this.pitch = Math.max(0.5, Math.min(1.5, pitch));
    this.notify();
  }

  public getStatus(): { isSpeaking: boolean; isPaused: boolean } {
    return {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
    };
  }

  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: unknown) => void
  ) {
    if (!this.synth) {
      onError?.(new Error('SpeechSynthesis is not supported in this browser.'));
      return;
    }

    // Cancel any active speech cleanly
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notify();
      onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notify();
      onEnd?.();
    };

    utterance.onerror = (event) => {
      // 'interrupted' is normal when user switches steps or pauses
      if (event.error !== 'interrupted') {
        console.warn('SpeechSynthesis error:', event.error);
      }
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notify();
      onError?.(event);
    };

    utterance.onpause = () => {
      this.isPaused = true;
      this.notify();
    };

    utterance.onresume = () => {
      this.isPaused = false;
      this.notify();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notify();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notify();
    }
  }

  public togglePlayPause(resumeFallback?: () => void) {
    if (this.isSpeaking) {
      if (this.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
    } else {
      resumeFallback?.();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

export const ttsEngine = new TextToSpeechEngine();
