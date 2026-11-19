import React, { useEffect, useRef } from 'react';

type ParallaxCallback = () => void;

const subscribers = new Set<ParallaxCallback>();
let rafId: number | null = null;
let listenersAttached = false;

function tickAll() {
  rafId = null;
  subscribers.forEach((cb) => cb());
}

function scheduleTick() {
  if (rafId !== null) return;
  rafId = window.requestAnimationFrame(tickAll);
}

function attachGlobalListeners() {
  if (listenersAttached || typeof window === 'undefined') return;
  listenersAttached = true;
  window.addEventListener('scroll', scheduleTick, { passive: true });
  window.addEventListener('resize', scheduleTick, { passive: true });
}

function subscribeParallax(cb: ParallaxCallback): () => void {
  attachGlobalListeners();
  subscribers.add(cb);
  scheduleTick();
  return () => {
    subscribers.delete(cb);
  };
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface ParallaxScrollPlaneProps {
  children: React.ReactNode;
  offsetRange?: [number, number];
  rotateRange?: [number, number];
  className?: string;
}

/**
 * Compositor-only GPU translate3d/rotate parallax driven by viewport scroll progress.
 * Zero React re-renders, zero layout shift (CLS = 0.000), honors prefers-reduced-motion.
 */
export function ParallaxScrollPlane({
  children,
  offsetRange = [-30, 30],
  rotateRange = [0, 0],
  className = '',
}: ParallaxScrollPlaneProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const update = () => {
      const outer = outerRef.current;
      const inner = innerRef.current;
      if (!outer || !inner) return;

      const rect = outer.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      const totalTravel = vh + rect.height;
      const rawProgress = totalTravel > 0 ? (vh - rect.top) / totalTravel : 0.5;
      const progress = Math.min(1, Math.max(0, rawProgress));

      const y = offsetRange[0] + (offsetRange[1] - offsetRange[0]) * progress;
      const deg = rotateRange[0] + (rotateRange[1] - rotateRange[0]) * progress;

      inner.style.transform =
        deg !== 0
          ? `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${deg.toFixed(2)}deg)`
          : `translate3d(0, ${y.toFixed(2)}px, 0)`;
    };

    return subscribeParallax(update);
  }, [offsetRange[0], offsetRange[1], rotateRange[0], rotateRange[1]]);

  return (
    <div ref={outerRef} className={className}>
      <div ref={innerRef} className="will-change-transform h-full transition-transform duration-75 ease-out">
        {children}
      </div>
    </div>
  );
}

interface ParallaxHeroLayerProps {
  children?: React.ReactNode;
  maxShift?: number;
  maxRotate?: number;
  className?: string;
  ariaHidden?: boolean;
}

/**
 * Top-of-page hero parallax layer responding directly to window.scrollY
 * for immediate, multi-plane editorial depth above the fold.
 */
export function ParallaxHeroLayer({
  children,
  maxShift = 60,
  maxRotate = 0,
  className = '',
  ariaHidden = false,
}: ParallaxHeroLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const update = () => {
      const el = layerRef.current;
      if (!el) return;
      const scrollY = window.scrollY || 0;
      const progress = Math.min(1, Math.max(0, scrollY / 720));
      const y = maxShift * progress;
      const deg = maxRotate * progress;

      el.style.transform =
        deg !== 0
          ? `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${deg.toFixed(2)}deg)`
          : `translate3d(0, ${y.toFixed(2)}px, 0)`;
    };

    return subscribeParallax(update);
  }, [maxShift, maxRotate]);

  return (
    <div
      ref={layerRef}
      aria-hidden={ariaHidden || undefined}
      className={`will-change-transform transition-transform duration-75 ease-out ${className}`}
    >
      {children}
    </div>
  );
}

interface ParallaxImagePanProps {
  src: string;
  alt: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'eager' | 'lazy';
  className?: string;
  imgClassName?: string;
  panPercent?: number;
}

/**
 * Architectural window parallax: image pans smoothly inside a fixed-aspect container
 * without affecting outer geometry (CLS = 0.000).
 */
export function ParallaxImagePan({
  src,
  alt,
  fetchPriority = 'auto',
  loading = 'lazy',
  className = '',
  imgClassName = '',
  panPercent = 6,
}: ParallaxImagePanProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const update = () => {
      const container = containerRef.current;
      const img = imgRef.current;
      if (!container || !img) return;

      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      const total = vh + rect.height;
      const progress = Math.min(1, Math.max(0, total > 0 ? (vh - rect.top) / total : 0.5));
      const shiftPct = -panPercent + panPercent * 2 * progress;

      img.style.transform = `translate3d(0, ${shiftPct.toFixed(2)}%, 0) scale(1.14)`;
    };

    return subscribeParallax(update);
  }, [panPercent]);

  return (
    <div ref={containerRef} className={`overflow-hidden relative ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        fetchPriority={fetchPriority}
        loading={loading}
        decoding="async"
        referrerPolicy="no-referrer"
        style={{ transform: 'translate3d(0, 0%, 0) scale(1.14)' }}
        className={`w-full h-full object-cover will-change-transform transition-transform duration-75 ease-out ${imgClassName}`}
      />
    </div>
  );
}
