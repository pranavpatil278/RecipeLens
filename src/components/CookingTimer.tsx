import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Bell, CheckCircle2 } from 'lucide-react';

interface CookingTimerProps {
  initialSeconds?: number;
  label?: string;
  onComplete?: () => void;
  autoStart?: boolean;
}

export const CookingTimer: React.FC<CookingTimerProps> = ({
  initialSeconds = 300,
  label = 'Step Timer',
  onComplete,
  autoStart = false,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Update when initialSeconds prop changes
  useEffect(() => {
    setTotalSeconds(initialSeconds);
    setRemainingSeconds(initialSeconds);
    setIsCompleted(false);
    setIsRunning(false);
  }, [initialSeconds]);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      }
    } catch {
      // audio chime non-blocking fallback
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval as unknown as number);
            setIsRunning(false);
            setIsCompleted(true);
            playChime();
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds, onComplete]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  const handleToggle = () => {
    if (isCompleted) {
      setRemainingSeconds(totalSeconds);
      setIsCompleted(false);
      setIsRunning(true);
    } else {
      setIsRunning((prev) => !prev);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setRemainingSeconds(totalSeconds);
  };

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all ${
        isCompleted
          ? 'bg-[#263A20] text-white border-[#263A20] shadow-md'
          : 'bg-[#FAF7F0] border-[#263A20]/15 text-[#263A20]'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Label & Progress ring */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isCompleted ? 'bg-white/20 text-white' : 'bg-[#263A20]/10 text-[#263A20]'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-[#A3B89D]" />
            ) : (
              <Clock className="w-5 h-5 stroke-[2]" />
            )}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
              {label}
            </div>
            <div className="font-serif font-bold text-2xl sm:text-3xl tracking-tight">
              {formattedTime}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggle}
            className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isCompleted
                ? 'bg-[#FAF7F0] text-[#263A20] hover:bg-white'
                : isRunning
                ? 'bg-[#263A20]/15 text-[#263A20] hover:bg-[#263A20]/25'
                : 'bg-[#263A20] text-white hover:bg-[#1C2C17]'
            }`}
          >
            {isCompleted ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                Restart Timer
              </>
            ) : isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Timer
              </>
            )}
          </button>

          {!isCompleted && remainingSeconds < totalSeconds && (
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-full border border-current opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Reset timer"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mini Progress Bar */}
      {!isCompleted && totalSeconds > 0 && (
        <div className="w-full h-1.5 bg-[#EDE5DA] rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-[#263A20] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {isCompleted && (
        <p className="text-[11px] text-[#A3B89D] pt-2 flex items-center gap-1">
          <Bell className="w-3.5 h-3.5" />
          Step cooking duration reached. Check visual cue!
        </p>
      )}
    </div>
  );
};
