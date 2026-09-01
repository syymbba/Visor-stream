import React, { useEffect, useRef, useState } from 'react';

const SPLASH_SEEN_KEY = 'visor_splash_seen';
const FALLBACK_DURATION_MS = 3000;
const FADE_DURATION_MS = 700;

function hasSeenSplashBefore(): boolean {
  try {
    return localStorage.getItem(SPLASH_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
}

// bg-[#0b0e14] matches both the root app shell (App.tsx's Suspense fallback
// and outer wrapper div) and index.css's body background - the two places
// that are actually visible behind/after this overlay, so the fade-out has
// nothing to mismatch against.
export const SplashScreen: React.FC = () => {
  const [shouldRender] = useState(() => !hasSeenSplashBefore());
  const [isMounted, setIsMounted] = useState(shouldRender);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const dismissedRef = useRef(false);

  const dismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    try {
      localStorage.setItem(SPLASH_SEEN_KEY, 'true');
    } catch {
      // Private browsing / storage disabled - splash just replays next
      // visit, not worth failing the dismissal over.
    }
    setIsFadingOut(true);
    setTimeout(() => setIsMounted(false), FADE_DURATION_MS);
  };

  useEffect(() => {
    if (!shouldRender) return;
    // Strict fallback in case `onEnded` never fires (video fails to load,
    // autoplay blocked outright, etc.) so a visitor is never stuck here.
    const fallbackTimer = setTimeout(dismiss, FALLBACK_DURATION_MS);
    return () => clearTimeout(fallbackTimer);
  }, [shouldRender]);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] h-screen w-screen flex items-center justify-center bg-[#0b0e14] transition-opacity duration-700 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Soft vignette so the video's rectangular edges blend into the
          background instead of showing a hard cut. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0b0e14_90%)]" />
      <video
        src="/splash-logo.mp4"
        autoPlay
        muted
        playsInline
        onEnded={dismiss}
        className="relative max-w-2xl w-full object-contain"
      />
    </div>
  );
};
