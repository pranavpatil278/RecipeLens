import { useState, useEffect, useCallback, useRef } from 'react';
import { RecipeStep } from '../types';
import { ttsEngine, formatStepForSpeech, SpeechFormatOptions } from '../services/textToSpeech';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRateState] = useState(ttsEngine.getRate());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoiceState] = useState<SpeechSynthesisVoice | null>(
    ttsEngine.getSelectedVoice()
  );
  const [isSupported] = useState(ttsEngine.isSupported());

  // Hands-free preferences
  const [autoReadSteps, setAutoReadSteps] = useState<boolean>(() => {
    try {
      return localStorage.getItem('recipelens_tts_autoread') === 'true';
    } catch {
      return false;
    }
  });

  const [includeSensoryCue, setIncludeSensoryCue] = useState<boolean>(true);
  const [includeIngredients, setIncludeIngredients] = useState<boolean>(false);

  // Sync with engine updates
  useEffect(() => {
    const updateState = () => {
      const status = ttsEngine.getStatus();
      setIsSpeaking(status.isSpeaking);
      setIsPaused(status.isPaused);
      setRateState(ttsEngine.getRate());
      setVoices(ttsEngine.getVoices());
      setSelectedVoiceState(ttsEngine.getSelectedVoice());
    };

    updateState();
    const unsubscribe = ttsEngine.subscribe(updateState);
    return () => {
      unsubscribe();
    };
  }, []);

  // Save autoRead preference
  const toggleAutoRead = useCallback(() => {
    setAutoReadSteps((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('recipelens_tts_autoread', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const setRate = useCallback((newRate: number) => {
    ttsEngine.setRate(newRate);
    setRateState(newRate);
  }, []);

  const setSelectedVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    ttsEngine.setSelectedVoice(voice);
    setSelectedVoiceState(voice);
  }, []);

  const stop = useCallback(() => {
    ttsEngine.stop();
  }, []);

  const pause = useCallback(() => {
    ttsEngine.pause();
  }, []);

  const resume = useCallback(() => {
    ttsEngine.resume();
  }, []);

  const speakStep = useCallback(
    (
      step: RecipeStep,
      totalSteps?: number,
      customOptions?: SpeechFormatOptions,
      onEnd?: () => void
    ) => {
      const options: SpeechFormatOptions = {
        includeStepNumber: true,
        includeSensoryCue,
        includeIngredients,
        ...customOptions,
      };

      const text = formatStepForSpeech(step, totalSteps, options);
      ttsEngine.speak(text, undefined, onEnd);
    },
    [includeSensoryCue, includeIngredients]
  );

  const togglePlayPauseStep = useCallback(
    (step: RecipeStep, totalSteps?: number) => {
      ttsEngine.togglePlayPause(() => {
        speakStep(step, totalSteps);
      });
    },
    [speakStep]
  );

  // Stop audio when component unmounts
  useEffect(() => {
    return () => {
      ttsEngine.stop();
    };
  }, []);

  return {
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
  };
}
