import React, { useEffect, useRef, useCallback } from 'react';

const TOTAL_FRAMES = 150;
const FRAME_PATH = (n: number) =>
  `/frames/ezgif-frame-${String(n).padStart(3, '0')}.png`;

export function ScrollVideoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(
    Array(TOTAL_FRAMES).fill(null),
  );
  const loadedCountRef = useRef(0);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imagesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const { width: cw, height: ch } = canvas;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh);
  }, []);

  const scheduleRender = useCallback(
    (frameIndex: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        drawFrame(frameIndex);
      });
    },
    [drawFrame],
  );

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.floor(progress * TOTAL_FRAMES),
    );
    if (frameIndex !== currentFrameRef.current) {
      currentFrameRef.current = frameIndex;
      scheduleRender(frameIndex);
    }
  }, [scheduleRender]);

  useEffect(() => {
    const loadImage = (index: number): Promise<void> =>
      new Promise((resolve) => {
        const img = new Image();
        img.src = FRAME_PATH(index + 1);
        img.onload = () => {
          imagesRef.current[index] = img;
          loadedCountRef.current += 1;
          if (index === currentFrameRef.current) scheduleRender(index);
          resolve();
        };
        img.onerror = () => resolve();
      });
    loadImage(0).then(() => {
      const BATCH = 10;
      const loadBatch = async (start: number) => {
        if (start >= TOTAL_FRAMES) return;
        const end = Math.min(start + BATCH, TOTAL_FRAMES);
        const promises: Promise<void>[] = [];
        for (let i = start; i < end; i++) promises.push(loadImage(i));
        await Promise.all(promises);
        setTimeout(() => loadBatch(end), 16);
      };
      loadBatch(1);
    });
  }, [scheduleRender]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll, handleResize]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden={true}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -2,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden={true}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          background:
            'linear-gradient(to bottom, rgba(10,14,8,0.54) 0%, rgba(10,14,8,0.36) 50%, rgba(10,14,8,0.54) 100%)',
        }}
      />
    </>
  );
}
