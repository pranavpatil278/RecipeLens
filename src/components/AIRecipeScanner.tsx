import React, { useState, useEffect, useRef, useCallback, MouseEvent } from 'react';
import {
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Camera,
  Upload,
  Layers,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { AnalysisResult, Viewport3DStatus } from '../types';
import phoneScanImage from '../assets/images/phone_dish_scanner_1789205806064.jpg';

export interface AIRecipeScannerProps {
  className?: string;
  imageSrc?: string | null;
  isAnalyzing?: boolean;
  analysisStage?: string;
  analysisResult?: AnalysisResult | null;
  viewportStatus?: Viewport3DStatus;
  onStatusChange?: (status: Viewport3DStatus) => void;
  onAnalyze?: () => void;
  onChangePhoto?: () => void;
  onRemovePhoto?: () => void;
  onCaptureClick?: () => void;
  onUploadClick?: () => void;
  onSelectSample?: (sampleKey: string) => void;
  onRetry?: () => void;
}

export type ScanPhase = 'idle' | 'settling' | 'scanning' | 'identifying' | 'completed';

interface DetectedIngredient {
  id: string;
  name: string;
  confidence: string;
  xPercent: number; // relative to image width
  yPercent: number; // relative to image height
  lineDirection: 'left' | 'right';
  time: number; // appear time in ms
}

// Minimal, elegant ingredient markers positioned over the pasta in the phone viewfinder
const INGREDIENT_MARKERS: DetectedIngredient[] = [
  {
    id: 'tomato',
    name: 'San Marzano Tomato',
    confidence: '98%',
    xPercent: 47,
    yPercent: 44,
    lineDirection: 'right',
    time: 800,
  },
  {
    id: 'basil',
    name: 'Sweet Genovese Basil',
    confidence: '96%',
    xPercent: 54,
    yPercent: 36,
    lineDirection: 'left',
    time: 1400,
  },
  {
    id: 'cheese',
    name: 'Aged Parmigiano',
    confidence: '94%',
    xPercent: 51,
    yPercent: 31,
    lineDirection: 'right',
    time: 2000,
  },
];

// ---------------------------------------------------------------------------
// Subcomponent: ScanLine
// ---------------------------------------------------------------------------
interface ScanLineProps {
  isActive?: boolean;
  progress?: number;
}

const ScanLine: React.FC<ScanLineProps> = ({ isActive = true }) => {
  if (!isActive) return null;

  return (
    <div
      className="absolute inset-x-0 pointer-events-none z-30 animate-scan-line-continuous -translate-y-1/2"
    >
      {/* Subtle volumetric light aura above the line */}
      <div
        className="w-full h-8 -mt-8 pointer-events-none animate-scan-glow"
        style={{
          background:
            'linear-gradient(to top, rgba(163, 184, 157, 0.32) 0%, rgba(163, 184, 157, 0.08) 50%, transparent 100%)',
        }}
      />

      {/* Thin, elegant scanning line using RecipeLens accent color (#263A20 / #A3B89D) */}
      <div className="relative w-full h-[2px] bg-[#263A20] shadow-[0_0_12px_rgba(163,184,157,0.95)]">
        {/* Subtle center beam glint */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-16 h-[3px] bg-[#FAF7F0] rounded-full blur-[0.5px] opacity-90 animate-scan-glow" />
      </div>

      {/* Trailing luminous hairline */}
      <div className="w-full h-[1px] bg-[#A3B89D]/70 mt-[1px]" />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Subcomponent: DetectionMarker
// ---------------------------------------------------------------------------
interface DetectionMarkerProps {
  ingredient: DetectedIngredient;
  isVisible: boolean;
  isCompleted: boolean;
}

const DetectionMarker: React.FC<DetectionMarkerProps> = ({
  ingredient,
  isVisible,
  isCompleted,
}) => {
  if (!isVisible) return null;

  const isRight = ingredient.lineDirection === 'right';

  return (
    <div
      className={`absolute z-30 pointer-events-auto transition-all duration-500 ease-out select-none ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}
      style={{
        top: `${ingredient.yPercent}%`,
        left: `${ingredient.xPercent}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="relative flex items-center">
        {/* Left-facing connector & label */}
        {!isRight && (
          <div className="flex items-center mr-2 animate-fadeIn">
            {/* Minimal label badge */}
            <div className="px-2.5 py-1 rounded-md bg-[#FAF7F0]/95 backdrop-blur-xs border border-[#263A20]/25 shadow-xs flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#263A20]" />
              <span className="font-sans font-semibold text-[10px] text-[#263A20] tracking-tight">
                {ingredient.name}
              </span>
              <span className="text-[9px] font-mono text-[#263A20]/60">
                {ingredient.confidence}
              </span>
            </div>
            {/* Hairline connector */}
            <div className="w-4 h-[1px] bg-[#263A20]/40" />
          </div>
        )}

        {/* Center Target Point: Subtle glowing anchor */}
        <div className="relative flex items-center justify-center w-5 h-5">
          {/* Continuous subtle pulse ring */}
          <div className="absolute inset-0 rounded-full border border-[#263A20]/50 animate-ping [animation-duration:2.4s]" />
          {/* Outer circle */}
          <div className="w-3.5 h-3.5 rounded-full bg-[#FAF7F0] border-[1.5px] border-[#263A20] shadow-xs flex items-center justify-center">
            {/* Inner dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#263A20]" />
          </div>
        </div>

        {/* Right-facing connector & label */}
        {isRight && (
          <div className="flex items-center ml-2 animate-fadeIn">
            {/* Hairline connector */}
            <div className="w-4 h-[1px] bg-[#263A20]/40" />
            {/* Minimal label badge */}
            <div className="px-2.5 py-1 rounded-md bg-[#FAF7F0]/95 backdrop-blur-xs border border-[#263A20]/25 shadow-xs flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#263A20]" />
              <span className="font-sans font-semibold text-[10px] text-[#263A20] tracking-tight">
                {ingredient.name}
              </span>
              <span className="text-[9px] font-mono text-[#263A20]/60">
                {ingredient.confidence}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Subcomponent: AIStatus
// ---------------------------------------------------------------------------
interface AIStatusProps {
  phase: ScanPhase;
  visibleCount: number;
  hasUserUploaded: boolean;
  isAnalyzing: boolean;
  analysisStage?: string;
  isAnalysisCompleted: boolean;
}

const AIStatus: React.FC<AIStatusProps> = ({
  phase,
  visibleCount,
  hasUserUploaded,
  isAnalyzing,
  analysisStage,
  isAnalysisCompleted,
}) => {
  let label = hasUserUploaded
    ? 'Dish photo ready // Continuously scanning'
    : 'Live Food Scanner Active // Continuously Scanning';
  let indicatorColor = 'bg-emerald-600';

  if (isAnalyzing) {
    label = analysisStage || 'Analyzing dish & ingredients...';
    indicatorColor = 'bg-amber-600';
  } else if (isAnalysisCompleted) {
    label = 'Dish identified // Live scan active';
    indicatorColor = 'bg-emerald-600';
  }

  return (
    <div
      id="ai-recipe-scanner-status"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF7F0]/95 backdrop-blur-xs border border-[#263A20]/15 shadow-2xs text-[11px] font-medium text-[#263A20] transition-all duration-300"
    >
      {/* Continuous Animated Scanning Indicator */}
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${indicatorColor} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${indicatorColor}`} />
      </span>

      <span className="tracking-tight font-sans">{label}</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Subcomponent: PhoneVisual (Contains the camera viewport, phone frame, scan line, markers)
// ---------------------------------------------------------------------------
interface PhoneVisualProps {
  imageSource: string;
  rotation: { x: number; y: number };
  isHovered: boolean;
  phase: ScanPhase;
  scanLineProgress: number;
  visibleMarkers: Set<string>;
  onImageClick?: () => void;
}

const PhoneVisual: React.FC<PhoneVisualProps> = ({
  imageSource,
  rotation,
  isHovered,
  phase,
  scanLineProgress,
  visibleMarkers,
  onImageClick,
}) => {
  return (
    <div
      id="phone-visual-3d-stage"
      className="relative w-full aspect-16/9 sm:aspect-16/10 rounded-2xl overflow-hidden cursor-pointer select-none transition-transform duration-200 ease-out shadow-xs"
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${
          isHovered ? 1.01 : 1
        })`,
      }}
      onClick={onImageClick}
      title="Click to scan food with camera"
    >
      {/* 1. Base Main Image (Preserved exactly as requested) */}
      <img
        src={imageSource}
        alt="RecipeLens Camera Dish Viewport"
        className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-500 ease-out"
        referrerPolicy="no-referrer"
        loading="eager"
      />

      {/* 2. Delicate Phone Screen Viewport Reticle Box (Only frames the food in the phone screen) */}
      <div
        className="absolute pointer-events-none z-20 border rounded-xl animate-reticle-pulse transition-opacity duration-300"
        style={{
          top: '22%',
          left: '38%',
          width: '28%',
          height: '42%',
        }}
      >
        {/* Viewport Corner Reticles */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#263A20]" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#263A20]" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#263A20]" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#263A20]" />

        {/* 3. AI Scanning Line (Continuously sweeps across food zone without stopping) */}
        <ScanLine isActive={true} />
      </div>

      {/* 4. Detection Markers (Visible with continuous pulse over the food) */}
      {INGREDIENT_MARKERS.map((item) => (
        <DetectionMarker
          key={item.id}
          ingredient={item}
          isVisible={true}
          isCompleted={false}
        />
      ))}

      {/* 5. Minimal Camera Flash / Lens Glare on Hover */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${50 + rotation.y * 3}% ${
            50 - rotation.x * 3
          }%, rgba(255,255,255,0.25) 0%, transparent 60%)`,
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// MAIN REUSABLE COMPONENT: AIRecipeScanner
// ---------------------------------------------------------------------------
export const AIRecipeScanner: React.FC<AIRecipeScannerProps> = ({
  className = '',
  imageSrc,
  isAnalyzing = false,
  analysisStage,
  analysisResult,
  viewportStatus,
  onStatusChange,
  onAnalyze,
  onChangePhoto,
  onRemovePhoto,
  onCaptureClick,
  onUploadClick,
  onSelectSample,
}) => {
  // Timeline Phase State
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [scanLineProgress, setScanLineProgress] = useState(0);
  const [visibleMarkers, setVisibleMarkers] = useState<Set<string>>(new Set());
  const [hasScannedOnce, setHasScannedOnce] = useState(false);

  // Parallax Tilt State (very small & subtle: max ±3° to ±4°)
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  // Prefer the provided high-res photograph as the main visual
  const activeImageSource = imageSrc || phoneScanImage || '/phone_dish_scanner.jpg';

  // Check reduced-motion preference
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Clear all pending timeouts safely
  const clearTimeline = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Run the optical scan sequence (settles into 'identifying' state, NEVER prematurely completes)
  const startScanSequence = useCallback(() => {
    clearTimeline();

    // 0.0s: Settle into position
    setPhase('settling');
    setScanLineProgress(0);
    setVisibleMarkers(new Set());

    if (isReducedMotion) {
      // Simplified sequence for reduced-motion
      const t1 = window.setTimeout(() => {
        setPhase('identifying');
        setVisibleMarkers(new Set(INGREDIENT_MARKERS.map((m) => m.id)));
      }, 400);
      timeoutsRef.current.push(t1);
      return;
    }

    // 0.4s: AI Scan line sweep begins
    const t0 = window.setTimeout(() => {
      setPhase('scanning');

      // Animate scan line from 5% to 95% of the dish bounding box smoothly over ~2.0s
      const startTime = performance.now();
      const duration = 2000;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const p = Math.min(1, elapsed / duration);
        const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
        setScanLineProgress(5 + ease * 90);

        if (p < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          // Finish pass and settle in identifying state
          setScanLineProgress(100);
          setPhase('identifying');
        }
      };

      animationFrameRef.current = requestAnimationFrame(step);
    }, 400);
    timeoutsRef.current.push(t0);

    // 0.7s: First ingredient marker appears (Tomato)
    const t1 = window.setTimeout(() => {
      setVisibleMarkers((prev) => new Set([...prev, 'tomato']));
    }, 700);
    timeoutsRef.current.push(t1);

    // 1.3s: Second marker appears (Basil) & state shifts to identifying
    const t2 = window.setTimeout(() => {
      setPhase('identifying');
      setVisibleMarkers((prev) => new Set([...prev, 'basil']));
    }, 1300);
    timeoutsRef.current.push(t2);

    // 1.9s: Third marker appears (Cheese)
    const t3 = window.setTimeout(() => {
      setVisibleMarkers((prev) => new Set([...prev, 'cheese']));
    }, 1900);
    timeoutsRef.current.push(t3);
  }, [clearTimeline, isReducedMotion]);

  // 1. Active Analysis In Progress:
  // When isAnalyzing is true, continuously oscillate the optical scan line and maintain active markers
  useEffect(() => {
    if (isAnalyzing) {
      clearTimeline();
      setPhase('scanning');
      setVisibleMarkers(new Set(['tomato']));

      const startTime = performance.now();
      const loopSweep = (now: number) => {
        const elapsed = now - startTime;
        // Smooth sine wave oscillation across the food viewport
        const progress = 50 + 38 * Math.sin(elapsed / 450);
        setScanLineProgress(progress);
        animationFrameRef.current = requestAnimationFrame(loopSweep);
      };
      animationFrameRef.current = requestAnimationFrame(loopSweep);

      const t1 = window.setTimeout(() => {
        setPhase('identifying');
        setVisibleMarkers(new Set(['tomato', 'basil']));
      }, 800);
      const t2 = window.setTimeout(() => {
        setVisibleMarkers(new Set(INGREDIENT_MARKERS.map((m) => m.id)));
      }, 1600);
      timeoutsRef.current.push(t1, t2);
    }
  }, [isAnalyzing, clearTimeline]);

  // 2. handleAnalysisCompleted Async Resolution:
  // Only when analysisResult arrives from handleAnalysisCompleted, transition to 'completed' / 'Dish identified'
  useEffect(() => {
    if (analysisResult && !isAnalyzing) {
      clearTimeline();
      setScanLineProgress(100);
      setVisibleMarkers(new Set(INGREDIENT_MARKERS.map((m) => m.id)));
      setPhase('completed');
      setHasScannedOnce(true);
    }
  }, [analysisResult, isAnalyzing, clearTimeline]);

  // 3. User Upload or Image Selection:
  // Trigger detection scan line pass and markers, settling in ready/identifying state without prematurely marking complete
  useEffect(() => {
    if (imageSrc && !analysisResult && !isAnalyzing) {
      startScanSequence();
    } else if (!imageSrc && !analysisResult) {
      clearTimeline();
      setPhase('idle');
      setScanLineProgress(0);
      setVisibleMarkers(new Set());
    }
  }, [imageSrc, analysisResult, isAnalyzing, startScanSequence, clearTimeline]);

  // Single primary scan action for the 3D stage:
  // Opens live camera to scan food, or triggers dish analysis if a meal is already captured
  const handlePrimaryScanAction = () => {
    if (imageSrc) {
      if (onAnalyze) {
        onAnalyze();
      } else {
        startScanSequence();
      }
    } else {
      if (onCaptureClick) {
        onCaptureClick();
      } else {
        startScanSequence();
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimeline();
    };
  }, [clearTimeline]);

  // 3D Parallax Mouse Handlers (only on desktop/hover-capable devices)
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion) return;
    if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Small, subtle tilt (capped at ±3.5 degrees)
    const rotateY = ((x - centerX) / centerX) * 3.5;
    const rotateX = -((y - centerY) / centerY) * 3.0;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div
      ref={containerRef}
      id="hero-3d-canvas-container"
      data-viewport-status={viewportStatus || 'READY'}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full bg-[#EDE5DA]/80 border border-[#263A20]/20 rounded-3xl overflow-hidden p-3.5 sm:p-4 transition-all duration-300 shadow-sm hover:shadow-md ${className}`}
    >
      {/* Top Header: AI Status & Single Primary Scan Action */}
      <div className="relative z-30 flex items-center justify-between gap-2 pb-2.5 border-b border-[#263A20]/10">
        {/* Left: AI Status Indicator */}
        <AIStatus
          phase={phase}
          visibleCount={visibleMarkers.size}
          hasUserUploaded={Boolean(imageSrc)}
          isAnalyzing={isAnalyzing}
          analysisStage={analysisStage}
          isAnalysisCompleted={Boolean(analysisResult && !isAnalyzing)}
        />

        {/* Right: One clear, prominent Scan Food button */}
        <button
          type="button"
          id="hero-3d-scan-food-btn"
          onClick={handlePrimaryScanAction}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-[#263A20] hover:bg-[#1C2C17] shadow-xs hover:shadow transition-all cursor-pointer"
          title={Boolean(imageSrc) ? 'Scan & identify this dish' : 'Scan food with camera'}
        >
          {Boolean(imageSrc) ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#A3B89D]" />
              <span>Scan Dish</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5 text-[#A3B89D]" />
              <span>Scan Food</span>
            </>
          )}
        </button>
      </div>

      {/* Main Center Stage: Phone Visual with 3D Parallax, ScanLine, & Detection Markers */}
      <div className="relative my-2 sm:my-3 w-full flex items-center justify-center">
        <PhoneVisual
          imageSource={activeImageSource}
          rotation={rotation}
          isHovered={isHovered}
          phase={phase}
          scanLineProgress={scanLineProgress}
          visibleMarkers={visibleMarkers}
          onImageClick={handlePrimaryScanAction}
        />
      </div>
    </div>
  );
};
