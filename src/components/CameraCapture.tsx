import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, SwitchCamera, Upload, Sparkles, ExternalLink } from 'lucide-react';

interface CameraCaptureProps {
  initialStream?: MediaStream | null;
  onCapture: (imageBlob: Blob, dataUrl: string, autoAnalyze?: boolean) => void;
  onCancel: () => void;
  onSwitchToUpload: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  initialStream,
  onCapture,
  onCancel,
  onSwitchToUpload,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(initialStream || null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isStarting, setIsStarting] = useState<boolean>(true);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [isInIframe, setIsInIframe] = useState<boolean>(false);

  // Check if running in iframe (like AI Studio preview)
  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }
  }, []);

  // Stop active stream tracks safely
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      setStream(null);
    }
    setStreamActive(false);
  }, [stream]);

  // Safely bind and play stream on video element
  const bindStreamToVideo = useCallback((mediaStream: MediaStream) => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.srcObject = mediaStream;
      video.muted = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setStreamActive(true);
            setIsStarting(false);
          })
          .catch((err) => {
            console.warn('Video play warning:', err);
            // Ensure muted autoplay
            video.muted = true;
            video.play()
              .then(() => {
                setStreamActive(true);
                setIsStarting(false);
              })
              .catch(() => {
                setStreamActive(true);
                setIsStarting(false);
              });
          });
      } else {
        setStreamActive(true);
        setIsStarting(false);
      }
    } catch (e) {
      console.warn('Stream attachment error:', e);
    }
  }, []);

  // Start or switch camera stream with progressive fallback
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    setIsStarting(true);
    setErrorMessage(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsStarting(false);
      setErrorMessage('Direct live camera streaming is not supported in this browser. Use the device camera button below.');
      return;
    }

    // Stop existing stream if switching
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      setStream(null);
    }

    let mediaStream: MediaStream | null = null;

    // Attempt 1: Specific facing mode
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing } },
        audio: false,
      });
    } catch (err1) {
      console.warn('Attempt 1 (ideal facingMode) failed, trying basic video:', err1);
      // Attempt 2: Universal basic video
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (err2) {
        console.warn('Attempt 2 (basic video) failed:', err2);
        const err = err2 as { name?: string; message?: string };
        setIsStarting(false);
        setStreamActive(false);

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMessage(
            'Browser camera permission is restricted or blocked by the preview window. You can snap a photo directly using your device camera below, or open this app in a full tab.'
          );
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setErrorMessage('No camera device was detected on your machine.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setErrorMessage('Camera is currently in use by another program. Close other camera apps and retry.');
        } else {
          setErrorMessage('Could not initialize live stream. Tap below to take a photo with your device camera.');
        }
        return;
      }
    }

    if (mediaStream) {
      setStream(mediaStream);
      bindStreamToVideo(mediaStream);
    }
  }, [bindStreamToVideo, stream]);

  // Mount effect: start camera immediately
  useEffect(() => {
    if (initialStream && initialStream.active) {
      setStream(initialStream);
      bindStreamToVideo(initialStream);
    } else {
      startCamera(facingMode);
    }

    return () => {
      stopStream();
    };
  }, [facingMode]);

  // Keep video element attached if ref updates
  useEffect(() => {
    if (stream && videoRef.current && (!videoRef.current.srcObject || videoRef.current.srcObject !== stream)) {
      bindStreamToVideo(stream);
    }
  }, [stream, bindStreamToVideo]);

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from active video element
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Visual shutter flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 180);

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedDataUrl(dataUrl);
        }
      },
      'image/jpeg',
      0.92
    );
  };

  // Native device camera capture (100% reliable on phones and laptops, bypassing iframe sandbox issues)
  const handleNativeCameraFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      setCapturedBlob(file);
      setCapturedDataUrl(resultStr);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerNativeCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleRetake = () => {
    setCapturedDataUrl(null);
    setCapturedBlob(null);
    if (stream && videoRef.current) {
      bindStreamToVideo(stream);
    } else {
      startCamera(facingMode);
    }
  };

  const handleConfirmPhoto = (autoAnalyze: boolean = true) => {
    if (capturedBlob && capturedDataUrl) {
      stopStream();
      onCapture(capturedBlob, capturedDataUrl, autoAnalyze);
    }
  };

  // Keyboard shortcut: Space or Enter to snap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (!capturedDataUrl && streamActive) {
          e.preventDefault();
          takePhoto();
        }
      } else if (e.key === 'Escape') {
        stopStream();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [capturedDataUrl, streamActive, onCancel, stopStream]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Food Camera Scanner"
      className="fixed inset-0 z-50 bg-[#263A20]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
    >
      <div className="bg-[#FAF7F0] border border-[#263A20]/15 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden Native Device Camera Input Fallback (Works 100% on iOS, Android, and Web) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleNativeCameraFile}
          className="hidden"
          aria-hidden="true"
          id="native-camera-input"
        />

        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#263A20]/10 flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#263A20]/10 flex items-center justify-center text-[#263A20]">
              <Camera className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#263A20]">
                  {capturedDataUrl ? 'Dish Captured' : 'Food Camera'}
                </h3>
                {!capturedDataUrl && streamActive && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#263A20]/70">
                {capturedDataUrl
                  ? 'Ready to recognize dish and ingredients'
                  : 'Point at any dish, meal, or ingredients'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!capturedDataUrl && streamActive && (
              <button
                type="button"
                onClick={handleFlipCamera}
                aria-label="Switch camera"
                className="w-8 h-8 rounded-full border border-[#263A20]/20 flex items-center justify-center text-[#263A20] hover:bg-[#263A20]/5 transition-colors cursor-pointer"
                title="Switch front/rear camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                stopStream();
                onCancel();
              }}
              aria-label="Close camera"
              className="w-8 h-8 rounded-full border border-[#263A20]/20 flex items-center justify-center text-[#263A20] hover:bg-[#263A20]/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="relative bg-[#182314] flex-1 min-h-[340px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          {/* Shutter Flash Animation */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-40 animate-pulse pointer-events-none" />
          )}

          {/* 1. Captured Photo Preview */}
          {capturedDataUrl ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-3 sm:p-4">
              <img
                src={capturedDataUrl}
                alt="Captured dish preview"
                className="max-h-[50vh] sm:max-h-[55vh] w-auto object-contain rounded-2xl shadow-xl border border-white/10"
              />
              <div className="absolute top-6 left-6 bg-[#263A20]/90 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-sm backdrop-blur-xs">
                <Check className="w-3.5 h-3.5 text-[#A3B89D]" />
                <span>Photo Ready</span>
              </div>
            </div>
          ) : (
            /* 2. Live Video Viewfinder */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={(e) => {
                  const target = e.currentTarget;
                  target.play().catch(() => {});
                  setStreamActive(true);
                  setIsStarting(false);
                }}
                onCanPlay={() => {
                  setStreamActive(true);
                  setIsStarting(false);
                }}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  streamActive ? 'opacity-100' : 'opacity-0 absolute'
                }`}
              />

              {/* Live Food Scan Reticle & Alignment Guide */}
              {streamActive && (
                <div className="absolute inset-6 sm:inset-10 pointer-events-none border border-white/30 rounded-3xl flex flex-col justify-between p-4 shadow-inner">
                  {/* Corner Reticles */}
                  <div className="flex justify-between">
                    <div className="w-5 h-5 border-t-3 border-l-3 border-[#A3B89D] rounded-tl-lg" />
                    <div className="w-5 h-5 border-t-3 border-r-3 border-[#A3B89D] rounded-tr-lg" />
                  </div>

                  {/* Scanning Line Effect */}
                  <div className="w-full relative overflow-hidden py-1">
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#A3B89D] to-transparent animate-pulse" />
                  </div>

                  {/* Center Plate Guide */}
                  <div className="text-center">
                    <span className="bg-black/65 text-white text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full backdrop-blur-md font-medium border border-white/10 shadow-sm">
                      🍽️ Center food inside frame
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <div className="w-5 h-5 border-b-3 border-l-3 border-[#A3B89D] rounded-bl-lg" />
                    <div className="w-5 h-5 border-b-3 border-r-3 border-[#A3B89D] rounded-br-lg" />
                  </div>
                </div>
              )}

              {/* Starting Camera Loading State */}
              {isStarting && !errorMessage && (
                <div className="text-white flex flex-col items-center gap-3 z-20">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#A3B89D]" />
                  <p className="text-xs text-white/90 font-medium">Opening food camera...</p>
                </div>
              )}

              {/* Fallback View when Live Video Stream is restricted/blocked */}
              {errorMessage && !streamActive && (
                <div className="p-6 sm:p-8 text-center max-w-md space-y-4 z-20 bg-[#182314]/95 rounded-2xl mx-4 border border-white/10 shadow-xl">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-[#A3B89D] flex items-center justify-center border border-emerald-500/30 shadow-xs">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 text-white">
                    <h4 className="font-serif font-bold text-base">Scan Food with Camera</h4>
                    <p className="text-xs text-white/75 leading-relaxed">
                      Tap below to snap a picture of your dish with your device camera. It works instantly and starts AI dish recognition!
                    </p>
                  </div>

                  {/* Primary 1-Tap Action: Native Device Camera */}
                  <div className="flex flex-col gap-2.5 pt-2">
                    <button
                      type="button"
                      id="btn-camera-snap-device"
                      onClick={handleTriggerNativeCamera}
                      className="bg-[#FAF7F0] text-[#263A20] font-semibold py-3 px-5 rounded-full text-xs sm:text-sm hover:bg-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Camera className="w-4 h-4 text-[#263A20]" />
                      <span>📸 Snap Photo with Device Camera</span>
                    </button>

                    <div className="flex items-center justify-center gap-2 pt-1">
                      {isInIframe && (
                        <button
                          type="button"
                          onClick={() => window.open(window.location.href, '_blank')}
                          className="text-[11px] text-white/80 hover:text-white underline flex items-center gap-1 cursor-pointer py-1 px-2 rounded hover:bg-white/5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open in Full Tab for Live Stream</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => startCamera(facingMode)}
                        className="text-[11px] text-white/80 hover:text-white flex items-center gap-1 cursor-pointer py-1 px-2 rounded hover:bg-white/5"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry Stream</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="px-5 py-3.5 bg-[#FAF7F0] border-t border-[#263A20]/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              stopStream();
              onSwitchToUpload();
            }}
            className="text-xs text-[#263A20]/75 hover:text-[#263A20] underline font-medium cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload from gallery</span>
          </button>

          {capturedDataUrl ? (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRetake}
                className="border border-[#263A20]/30 text-[#263A20] px-4 py-2 rounded-full text-xs font-medium hover:bg-[#263A20]/5 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                id="btn-scan-captured-dish"
                onClick={() => handleConfirmPhoto(true)}
                className="bg-[#263A20] hover:bg-[#1C2C17] text-white px-5 py-2 rounded-full text-xs font-semibold transition-all shadow-xs hover:shadow cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#A3B89D]" />
                <span>Scan Dish Now</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Device camera 1-tap fallback button */}
              <button
                type="button"
                onClick={handleTriggerNativeCamera}
                className="text-xs text-[#263A20] px-3.5 py-1.5 rounded-full border border-[#263A20]/25 hover:bg-[#263A20]/5 transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
                title="Use device camera app"
              >
                <Camera className="w-3.5 h-3.5 text-[#263A20]" />
                <span>Device Camera</span>
              </button>

              {/* Shutter button to scan food */}
              {streamActive && (
                <button
                  type="button"
                  id="btn-take-food-photo"
                  onClick={takePhoto}
                  className="w-13 h-13 rounded-full bg-[#263A20] hover:bg-[#1C2C17] border-4 border-[#FAF7F0] shadow-md flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer group"
                  aria-label="Snap food photo"
                  title="Capture meal photo (Space / Enter)"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-white/90 group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
