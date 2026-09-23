import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Layers,
  Scan,
  RefreshCw,
  CheckCircle2,
  X,
  Rotate3d,
  Loader2,
  AlertCircle,
  Activity,
  Radio,
} from 'lucide-react';
import { AnalysisResult, Viewport3DStatus } from '../types';

interface Hero3DProps {
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

export const Hero3D: React.FC<Hero3DProps> = ({
  className = '',
  imageSrc,
  isAnalyzing = false,
  analysisStage,
  analysisResult,
  viewportStatus: controlledStatus,
  onStatusChange,
  onAnalyze,
  onChangePhoto,
  onRemovePhoto,
  onCaptureClick,
  onUploadClick,
  onSelectSample,
  onRetry,
}) => {
  // 3D Viewport Navigation State
  const [activeTab, setActiveTab] = useState<'orbit' | 'exploded' | 'wireframe'>('orbit');
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [lightPos, setLightPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // Internal loading simulation when switching images
  const [internalLoading, setInternalLoading] = useState(false);
  const [hasRenderError, setHasRenderError] = useState(false);
  const [demoStateOverride, setDemoStateOverride] = useState<Viewport3DStatus | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevImageSrcRef = useRef<string | null | undefined>(imageSrc);

  // Automatically trigger a brief high-tech LOADING state when a new image is loaded
  useEffect(() => {
    if (imageSrc && imageSrc !== prevImageSrcRef.current) {
      prevImageSrcRef.current = imageSrc;
      setHasRenderError(false);
      setInternalLoading(true);
      const timer = window.setTimeout(() => {
        setInternalLoading(false);
      }, 550);
      return () => window.clearTimeout(timer);
    }
    prevImageSrcRef.current = imageSrc;
  }, [imageSrc]);

  // Derive active viewport status
  const activeStatus: Viewport3DStatus =
    demoStateOverride ??
    controlledStatus ??
    (hasRenderError
      ? 'ERROR'
      : isAnalyzing
      ? 'SCANNING'
      : internalLoading
      ? 'LOADING'
      : imageSrc
      ? 'READY'
      : 'IDLE');

  // Notify parent if status changes
  useEffect(() => {
    onStatusChange?.(activeStatus);
  }, [activeStatus, onStatusChange]);

  // Mouse move handler for realistic 3D perspective tilt
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation limits (-15 to +15 deg)
    const rotateY = ((x - centerX) / centerX) * 16;
    const rotateX = -((y - centerY) / centerY) * 14;

    setRotation({ x: rotateX, y: rotateY });
    setLightPos({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100),
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
    setLightPos({ x: 50, y: 50 });
    setActiveHotspot(null);
  };

  // Interactive 3D Hotspots
  const defaultHotspots = [
    {
      id: 'garnish',
      name: 'Toasted Kasuri Methi & Cream Swirl',
      confidence: '98%',
      layer: 'Top Garnish Layer',
      x: '34%',
      y: '30%',
      depth: 'translateZ(55px)',
    },
    {
      id: 'sauce',
      name: 'Tomato-Velvety Butter Emulsion',
      confidence: '97%',
      layer: 'Spiced Sauce Layer',
      x: '62%',
      y: '48%',
      depth: 'translateZ(38px)',
    },
    {
      id: 'protein',
      name: 'Tandoori-Charred Chicken',
      confidence: '99%',
      layer: 'Core Protein Base',
      x: '42%',
      y: '68%',
      depth: 'translateZ(20px)',
    },
  ];

  return (
    <div
      ref={containerRef}
      id="hero-3d-canvas-container"
      data-animation-slot="nextjs-3d-culinary-stage"
      data-viewport-status={activeStatus}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full min-h-[440px] sm:min-h-[500px] bg-[#EDE5DA]/80 border border-[#263A20]/20 rounded-3xl overflow-hidden flex flex-col justify-between p-4 sm:p-5 select-none transition-all duration-300 shadow-sm hover:shadow-md ${className}`}
      style={{
        perspective: '1100px',
      }}
    >
      {/* Specular Glare / Dynamic Lighting Overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-60 z-30"
        style={{
          background: `radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 65%)`,
        }}
      />

      {/* TOP 3D TELEMETRY & VIEWPORT STATUS HEADER */}
      <div className="relative z-40 flex flex-wrap items-center justify-between gap-2 border-b border-[#263A20]/10 pb-3">
        {/* Left: Viewport Mode Tabs (only active when READY or SCANNING) */}
        <div className="flex items-center gap-1 bg-[#FAF7F0]/90 backdrop-blur-xs p-1 rounded-full border border-[#263A20]/15 shadow-2xs">
          <button
            type="button"
            id="tab-3d-orbit"
            onClick={() => setActiveTab('orbit')}
            disabled={activeStatus === 'LOADING' || activeStatus === 'ERROR'}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              activeTab === 'orbit'
                ? 'bg-[#263A20] text-white shadow-xs'
                : 'text-[#263A20]/75 hover:text-[#263A20]'
            }`}
          >
            <Rotate3d className="w-3 h-3" />
            <span>3D Orbit</span>
          </button>

          <button
            type="button"
            id="tab-3d-exploded"
            onClick={() => setActiveTab('exploded')}
            disabled={activeStatus === 'LOADING' || activeStatus === 'ERROR' || activeStatus === 'IDLE'}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              activeTab === 'exploded'
                ? 'bg-[#263A20] text-white shadow-xs'
                : 'text-[#263A20]/75 hover:text-[#263A20]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Exploded View</span>
          </button>

          <button
            type="button"
            id="tab-3d-wireframe"
            onClick={() => setActiveTab('wireframe')}
            disabled={activeStatus === 'LOADING' || activeStatus === 'ERROR' || activeStatus === 'IDLE'}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              activeTab === 'wireframe'
                ? 'bg-[#263A20] text-white shadow-xs'
                : 'text-[#263A20]/75 hover:text-[#263A20]'
            }`}
          >
            <Scan className="w-3 h-3" />
            <span>Sensor HUD</span>
          </button>
        </div>

        {/* Center/Right: Distinct Dynamic Status Badge for Current UI State */}
        <div className="flex items-center gap-2">
          {/* UI State Badge: IDLE */}
          {activeStatus === 'IDLE' && (
            <div
              id="viewport-status-idle"
              className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-[#263A20]/80 bg-[#FAF7F0] px-2.5 py-1 rounded-full border border-[#263A20]/20 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-stone-400" />
              <span>STATUS: IDLE // STANDBY</span>
            </div>
          )}

          {/* UI State Badge: LOADING */}
          {activeStatus === 'LOADING' && (
            <div
              id="viewport-status-loading"
              className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300 shadow-2xs animate-pulse"
            >
              <Loader2 className="w-3 h-3 text-amber-700 animate-spin" />
              <span>STATUS: LOADING // 3D MESH</span>
            </div>
          )}

          {/* UI State Badge: SCANNING */}
          {activeStatus === 'SCANNING' && (
            <div
              id="viewport-status-scanning"
              className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-400 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <Radio className="w-3 h-3 text-emerald-700 animate-pulse" />
              <span>STATUS: SCANNING // LIDAR</span>
            </div>
          )}

          {/* UI State Badge: READY */}
          {activeStatus === 'READY' && (
            <div
              id="viewport-status-ready"
              className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-[#263A20] bg-emerald-50/80 px-2.5 py-1 rounded-full border border-emerald-300/80 shadow-2xs"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              <span>STATUS: READY // 3D ACTIVE</span>
            </div>
          )}

          {/* UI State Badge: ERROR */}
          {activeStatus === 'ERROR' && (
            <div
              id="viewport-status-error"
              className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-rose-900 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-300 shadow-2xs"
            >
              <AlertCircle className="w-3 h-3 text-rose-700" />
              <span>STATUS: ERROR // RENDER FAILED</span>
            </div>
          )}

          {/* Live Gyro / Telemetry Tag */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-[#263A20]/70 bg-[#FAF7F0]/70 px-2.5 py-1 rounded-full border border-[#263A20]/10">
            <span>Y: {rotation.y > 0 ? `+${rotation.y.toFixed(0)}` : rotation.y.toFixed(0)}°</span>
            <span>P: {rotation.x > 0 ? `+${rotation.x.toFixed(0)}` : rotation.x.toFixed(0)}°</span>
          </div>

          {/* Interactive State Tester / Switcher Pill */}
          <div className="hidden md:flex items-center gap-1 bg-[#FAF7F0]/60 p-0.5 rounded-full border border-[#263A20]/10 text-[9px] font-mono text-[#263A20]/60">
            <span className="px-1.5 text-[8px] uppercase tracking-wider font-bold">STATE:</span>
            <button
              type="button"
              onClick={() => setDemoStateOverride(demoStateOverride === 'IDLE' ? null : 'IDLE')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                activeStatus === 'IDLE' ? 'bg-[#263A20] text-white font-bold' : 'hover:text-[#263A20]'
              }`}
              title="Preview IDLE UI state"
            >
              IDLE
            </button>
            <button
              type="button"
              onClick={() => setDemoStateOverride(demoStateOverride === 'LOADING' ? null : 'LOADING')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                activeStatus === 'LOADING' ? 'bg-[#263A20] text-white font-bold' : 'hover:text-[#263A20]'
              }`}
              title="Preview LOADING UI state"
            >
              LOAD
            </button>
            <button
              type="button"
              onClick={() => setDemoStateOverride(demoStateOverride === 'SCANNING' ? null : 'SCANNING')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                activeStatus === 'SCANNING' ? 'bg-[#263A20] text-white font-bold' : 'hover:text-[#263A20]'
              }`}
              title="Preview SCANNING UI state"
            >
              SCAN
            </button>
            <button
              type="button"
              onClick={() => setDemoStateOverride(demoStateOverride === 'READY' ? null : 'READY')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                activeStatus === 'READY' ? 'bg-[#263A20] text-white font-bold' : 'hover:text-[#263A20]'
              }`}
              title="Preview READY UI state"
            >
              READY
            </button>
          </div>
        </div>
      </div>

      {/* CENTER 3D STAGE (Transforms in 3D Space with State-Specific Visuals) */}
      <div className="relative flex-1 flex items-center justify-center my-3 w-full overflow-visible">
        {/* The 3D Rotating Canvas Model */}
        <div
          id="hero-3d-stage-model"
          className="relative w-full max-w-[340px] sm:max-w-[420px] aspect-4/3 rounded-2xl transition-transform duration-100 ease-out flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(${
              isHovered ? 1.03 : 1
            }, ${isHovered ? 1.03 : 1}, 1)`,
          }}
        >
          {/* Subtle Ambient Drop Shadow in Z-Space */}
          <div
            className="absolute inset-x-8 -bottom-6 h-12 rounded-full bg-[#263A20]/15 blur-xl pointer-events-none"
            style={{
              transform: 'translateZ(-40px)',
            }}
          />

          {/* Precision Sensor Grid Background */}
          <div
            className="absolute inset-0 rounded-2xl border border-[#263A20]/20 bg-[#FAF7F0] overflow-hidden shadow-inner"
            style={{
              transform: 'translateZ(0px)',
            }}
          >
            <svg className="w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="sensor-grid-3d" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#263A20" strokeWidth="0.5" strokeDasharray="2 2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#sensor-grid-3d)" />
              <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#263A20" strokeWidth="0.75" strokeDasharray="3 3" />
              <circle cx="50%" cy="50%" r="18%" fill="none" stroke="#263A20" strokeWidth="0.5" />
            </svg>
          </div>

          {/* ========================================================================= */}
          {/* UI STATE 1: LOADING STATE (Initializes 3D mesh, shaders, textures) */}
          {/* ========================================================================= */}
          {activeStatus === 'LOADING' && (
            <div
              id="viewport-state-loading-view"
              className="relative w-full h-full p-6 flex flex-col items-center justify-center text-center select-none"
              style={{ transform: 'translateZ(30px)' }}
            >
              {/* Rotating 3D Holographic Wireframe Cube / Ring */}
              <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
                {/* Outer spinning ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-600/40 animate-spin [animation-duration:8s]" />
                
                {/* Inner pulsing geometric ring */}
                <div className="absolute inset-2 rounded-2xl border border-amber-600/60 rotate-45 animate-pulse" />
                
                {/* Center Loading Spinner */}
                <div className="relative w-12 h-12 rounded-full bg-amber-100/80 border border-amber-400 flex items-center justify-center shadow-md">
                  <Loader2 className="w-6 h-6 text-amber-800 animate-spin" />
                </div>
              </div>

              <div className="space-y-1.5 max-w-xs">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold block">
                  INITIALIZING 3D SPATIAL MAP
                </span>
                <h4 className="font-serif font-bold text-sm text-[#263A20]">
                  Calibrating Depth Topology...
                </h4>
                <p className="text-[11px] text-[#263A20]/70 leading-relaxed">
                  Decoding culinary geometry, specular surfaces, and anchoring interactive perspective coordinates.
                </p>
              </div>

              {/* Progress HUD Indicators */}
              <div className="mt-4 flex items-center gap-2 text-[9px] font-mono text-[#263A20]/75 bg-[#FAF7F0] px-3 py-1 rounded-full border border-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                <span>VERTICES: 12,480 PTS</span>
                <span>•</span>
                <span>SHADERS: COMPILED</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* UI STATE 2: SCANNING STATE (Laser sweep, raycast telemetry, depth pass) */}
          {/* ========================================================================= */}
          {activeStatus === 'SCANNING' && (
            <div
              id="viewport-state-scanning-view"
              className="relative w-full h-full p-3 flex items-center justify-center select-none"
              style={{ transform: 'translateZ(25px)' }}
            >
              {/* Dish Photo with 3D Laser Scanning Reticle */}
              <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-emerald-600/60 shadow-lg bg-black">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="Scanning Dish"
                    className="w-full h-full object-cover opacity-85 contrast-110 brightness-95"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1C2C17] flex items-center justify-center">
                    <Scan className="w-16 h-16 text-emerald-400/40 animate-pulse" />
                  </div>
                )}

                {/* 3D Vertical Laser Plane Sweep */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
                  <div className="w-full h-2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#34d399] animate-[bounce_2.5s_infinite]" />
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent pointer-events-none" />
                </div>

                {/* HUD Corner Reticles */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />

                {/* Center Crosshair Target */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 border border-emerald-400/50 rounded-full flex items-center justify-center animate-ping [animation-duration:3s]">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  </div>
                </div>

                {/* Floating Telemetry HUD Card during scan */}
                <div className="absolute bottom-2 inset-x-2 bg-[#263A20]/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-emerald-500/40 flex items-center justify-between z-30">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <div>
                      <span className="text-[9px] font-mono text-emerald-300 block uppercase font-bold">
                        LIDAR RAYCAST ACTIVE (48.2 kHz)
                      </span>
                      <span className="text-[11px] font-medium block truncate max-w-[200px]">
                        {analysisStage || 'Detecting ingredient topology & depth...'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-white/70 bg-white/10 px-2 py-0.5 rounded">
                    PASS 2/3
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* UI STATE 3: ERROR STATE (Graceful failure recovery with retry button) */}
          {/* ========================================================================= */}
          {activeStatus === 'ERROR' && (
            <div
              id="viewport-state-error-view"
              className="relative w-full h-full p-6 flex flex-col items-center justify-center text-center select-none"
              style={{ transform: 'translateZ(30px)' }}
            >
              <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 mb-3 shadow-sm">
                <AlertCircle className="w-8 h-8" />
              </div>

              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-700 font-bold">
                VIEWPORT EXCEPTION // CODE: E_RENDER
              </span>
              <h4 className="font-serif font-bold text-base text-[#263A20] mt-1 mb-1">
                Unable to Resolve 3D Mesh
              </h4>
              <p className="text-[11px] text-[#263A20]/75 max-w-xs leading-relaxed mb-4">
                The image couldn't be mapped onto the 3D culinary coordinate grid. Please retry or choose another photo.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHasRenderError(false);
                    setDemoStateOverride(null);
                    onRetry?.();
                  }}
                  className="bg-[#263A20] hover:bg-[#1C2C17] text-white px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer shadow-xs"
                >
                  Retry Render
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasRenderError(false);
                    setDemoStateOverride('IDLE');
                    onRemovePhoto?.();
                  }}
                  className="border border-[#263A20]/30 hover:bg-[#263A20]/5 text-[#263A20] px-3 py-1.5 rounded-full text-xs cursor-pointer"
                >
                  Reset Viewport
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* UI STATE 4: READY STATE (Full interactive 3D Orbit / Exploded / HUD) */}
          {/* ========================================================================= */}
          {activeStatus === 'READY' && imageSrc && (
            <div
              id="viewport-state-ready-view"
              className="relative w-full h-full p-3 flex items-center justify-center"
            >
              {/* Tab 1: Standard Orbit View */}
              {activeTab === 'orbit' && (
                <div
                  className="relative w-full h-full rounded-xl overflow-hidden border-2 border-[#263A20]/30 shadow-md bg-black transition-all"
                  style={{
                    transform: 'translateZ(25px)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Captured Dish"
                    onError={() => setHasRenderError(true)}
                    className="w-full h-full object-cover"
                  />

                  {/* Corner Target Reticles */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/70 pointer-events-none" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white/70 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white/70 pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/70 pointer-events-none" />

                  {/* 3D Floating Hotspots Anchored Above Photo */}
                  {defaultHotspots.map((spot) => (
                    <div
                      key={spot.id}
                      className="absolute z-30 cursor-pointer"
                      style={{
                        top: spot.y,
                        left: spot.x,
                        transform: spot.depth,
                      }}
                      onClick={() =>
                        setActiveHotspot(activeHotspot === spot.id ? null : spot.id)
                      }
                    >
                      <div className="relative flex items-center">
                        <span className="w-4 h-4 rounded-full bg-[#FAF7F0] border-2 border-[#263A20] shadow-md flex items-center justify-center animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#263A20]" />
                        </span>

                        {/* Tooltip Card */}
                        {(activeHotspot === spot.id || isHovered) && (
                          <div className="ml-2 bg-[#263A20]/95 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap shadow-lg border border-white/20 pointer-events-none">
                            <span className="font-semibold block">{spot.name}</span>
                            <span className="text-[#A3B89D] text-[9px]">{spot.confidence} Match • {spot.layer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Exploded View (Deconstructed along Z-Axis) */}
              {activeTab === 'exploded' && (
                <div
                  className="relative w-full h-full flex items-center justify-center"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Layer 1: Ceramic Plate Base (Z: -20px) */}
                  <div
                    className="absolute w-[88%] h-[88%] rounded-xl border border-[#263A20]/30 bg-[#FAF7F0] shadow-sm flex items-end p-2"
                    style={{ transform: 'translateZ(-25px) translateY(12px) rotateX(8deg)' }}
                  >
                    <span className="text-[10px] font-mono text-[#263A20]/70 font-semibold">
                      [Layer 0: Ceramic Base & Heat]
                    </span>
                  </div>

                  {/* Layer 2: Main Protein & Grains (Z: +10px) */}
                  <div
                    className="absolute w-[84%] h-[84%] rounded-xl overflow-hidden border border-[#263A20]/40 shadow-md"
                    style={{ transform: 'translateZ(15px) translateY(0px)' }}
                  >
                    <img
                      src={imageSrc}
                      alt="Base Protein"
                      className="w-full h-full object-cover opacity-90 contrast-105"
                    />
                    <div className="absolute top-2 left-2 bg-[#263A20]/90 text-white px-2 py-0.5 rounded text-[9px] font-mono">
                      [Layer 1: Protein & Foundation]
                    </div>
                  </div>

                  {/* Layer 3: Sauce & Spices Matrix (Z: +45px) */}
                  <div
                    className="absolute w-[80%] h-[80%] rounded-xl border-2 border-amber-600/60 bg-amber-500/15 backdrop-blur-[1px] shadow-lg flex items-center justify-center p-3"
                    style={{ transform: 'translateZ(50px) translateY(-14px) rotateX(-4deg)' }}
                  >
                    <div className="bg-[#263A20]/95 text-white px-3 py-1.5 rounded-lg text-center shadow-md">
                      <span className="text-[10px] font-bold block">Spiced Sauce & Emulsion</span>
                      <span className="text-[9px] text-[#A3B89D]">Tomato, fenugreek, cream</span>
                    </div>
                  </div>

                  {/* Layer 4: Microgreen & Fresh Garnish (Z: +80px) */}
                  <div
                    className="absolute w-[76%] h-[76%] rounded-xl border-2 border-emerald-600/70 bg-emerald-500/10 pointer-events-none flex items-start justify-end p-2"
                    style={{ transform: 'translateZ(85px) translateY(-26px) rotateX(-8deg)' }}
                  >
                    <span className="bg-emerald-900/90 text-white text-[9px] px-2 py-0.5 rounded-md font-mono shadow-md">
                      [Layer 3: Aromatics & Herb Garnish]
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 3: Sensor HUD Mode */}
              {activeTab === 'wireframe' && (
                <div
                  className="relative w-full h-full rounded-xl border border-[#263A20]/50 bg-[#1C2C17] text-white p-4 flex flex-col justify-between"
                  style={{ transform: 'translateZ(30px)' }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-[#A3B89D] font-mono block">MULTIMODAL SENSOR 3D</span>
                      <span className="font-serif font-bold text-sm">Optical Depth Topology</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-mono">
                      60 FPS LIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-white/80 my-auto">
                    <div className="bg-white/5 p-2 rounded border border-white/10">
                      <span className="text-white/50 block">EST. VOLUME:</span>
                      <span className="text-white font-bold">480 cm³</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded border border-white/10">
                      <span className="text-white/50 block">SURFACE TEMP:</span>
                      <span className="text-white font-bold">~64°C (Warm)</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded border border-white/10">
                      <span className="text-white/50 block">VISUAL DENSITY:</span>
                      <span className="text-white font-bold">High (Rich Emulsion)</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded border border-white/10">
                      <span className="text-white/50 block">COLOR SPECTRUM:</span>
                      <span className="text-white font-bold">#C84B31 / #E4A951</span>
                    </div>
                  </div>

                  <div className="text-[9px] text-[#A3B89D] text-center font-mono">
                    Ready to generate precise ingredient weights & cooking steps
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* UI STATE 5: IDLE STATE (Resting viewport, prompt to capture/upload) */}
          {/* ========================================================================= */}
          {activeStatus === 'IDLE' && (
            <div
              id="viewport-state-idle-view"
              className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center"
              style={{ transform: 'translateZ(25px)' }}
            >
              {/* Center 3D Plate Silhouette */}
              <div className="relative mb-3 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-[#263A20]/35 bg-[#FAF7F0] shadow-sm flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border border-[#263A20]/25 flex items-center justify-center bg-[#EDE5DA]/50">
                    <Camera className="w-8 h-8 text-[#263A20]/75" />
                  </div>
                </div>

                {/* Orbiting Ring Indicator */}
                <div className="absolute -inset-3 rounded-full border border-[#263A20]/20 pointer-events-none animate-spin [animation-duration:18s]" />
              </div>

              <div className="space-y-1 max-w-xs">
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#263A20]">
                  3D Food Lens & Stage
                </h4>
                <p className="text-[11px] text-[#263A20]/70 leading-relaxed">
                  Hover to orbit in 3D. Capture a dish or upload a photo to inspect its culinary structure.
                </p>
              </div>

              {/* One-Click Sample Presets */}
              <div className="mt-4 pt-3 border-t border-[#263A20]/10 flex items-center gap-1.5 flex-wrap justify-center text-[10px]">
                <span className="font-semibold text-[#263A20]">Try Sample:</span>
                <button
                  type="button"
                  onClick={() => {
                    setDemoStateOverride(null);
                    onSelectSample?.('butter_chicken');
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-[#263A20]/20 hover:bg-[#263A20] hover:text-white transition-colors cursor-pointer"
                >
                  Butter Chicken
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDemoStateOverride(null);
                    onSelectSample?.('matcha_latte');
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-[#263A20]/20 hover:bg-[#263A20] hover:text-white transition-colors cursor-pointer"
                >
                  Matcha Latte
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDemoStateOverride(null);
                    onSelectSample?.('tuscan_pasta');
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-[#263A20]/20 hover:bg-[#263A20] hover:text-white transition-colors cursor-pointer"
                >
                  Tuscan Pasta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM ACTION & CONTROLS FOOTER (Reflects current UI state) */}
      {/* ========================================================================= */}
      <div className="relative z-40 pt-2 border-t border-[#263A20]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: State Status Feedback Message */}
        <div className="flex items-center gap-2 text-xs text-[#263A20]">
          {activeStatus === 'LOADING' ? (
            <>
              <Loader2 className="w-4 h-4 text-amber-700 animate-spin shrink-0" />
              <span className="font-semibold text-amber-900">
                Initializing 3D spatial scene & shaders...
              </span>
            </>
          ) : activeStatus === 'SCANNING' ? (
            <>
              <Radio className="w-4 h-4 text-emerald-700 animate-pulse shrink-0" />
              <span className="font-semibold text-emerald-900">
                {analysisStage || 'Scanning 3D Dish Topology...'}
              </span>
            </>
          ) : activeStatus === 'ERROR' ? (
            <>
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span className="font-semibold text-rose-900">
                Render exception in 3D viewport
              </span>
            </>
          ) : activeStatus === 'READY' && imageSrc ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-semibold">
                Photo Loaded in 3D Stage (Orbit & Explode Ready)
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#263A20]" />
              <span className="text-[#263A20]/75">
                Ready to capture or upload dish for 3D analysis
              </span>
            </>
          )}
        </div>

        {/* Right: State-Appropriate Interactive Action Buttons */}
        <div className="flex items-center gap-2">
          {activeStatus === 'READY' && imageSrc && (
            <>
              <button
                type="button"
                id="btn-analyze-dish-3d"
                onClick={onAnalyze}
                className="bg-[#263A20] hover:bg-[#1C2C17] text-white px-5 py-2 rounded-full text-xs font-medium shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#A3B89D]" />
                <span>Analyze Dish</span>
              </button>

              <button
                type="button"
                onClick={onChangePhoto}
                className="border border-[#263A20]/30 hover:border-[#263A20] px-3.5 py-2 rounded-full text-xs text-[#263A20] font-medium hover:bg-[#263A20]/5 transition-colors cursor-pointer"
              >
                Change Photo
              </button>

              <button
                type="button"
                onClick={() => {
                  setDemoStateOverride(null);
                  onRemovePhoto?.();
                }}
                aria-label="Remove photo"
                className="p-2 rounded-full border border-[#263A20]/20 text-[#263A20]/70 hover:text-red-700 hover:border-red-300 transition-colors cursor-pointer"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {activeStatus === 'LOADING' && (
            <div className="text-[11px] font-mono text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Preparing Viewport...</span>
            </div>
          )}

          {activeStatus === 'SCANNING' && (
            <div className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-300 flex items-center gap-1.5">
              <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
              <span>Scanning In Progress</span>
            </div>
          )}

          {activeStatus === 'IDLE' && (
            <>
              <button
                type="button"
                onClick={onCaptureClick}
                className="bg-[#263A20] hover:bg-[#1C2C17] text-white px-4 py-2 rounded-full text-xs font-medium transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-[#A3B89D]" />
                <span>Camera</span>
              </button>

              <button
                type="button"
                onClick={onUploadClick}
                className="border border-[#263A20]/30 hover:border-[#263A20] px-4 py-2 rounded-full text-xs text-[#263A20] font-medium hover:bg-[#263A20]/5 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Image</span>
              </button>
            </>
          )}

          {activeStatus === 'ERROR' && (
            <button
              type="button"
              onClick={() => {
                setHasRenderError(false);
                setDemoStateOverride('IDLE');
                onRemovePhoto?.();
              }}
              className="bg-[#263A20] text-white px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer"
            >
              Reset Viewport
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
