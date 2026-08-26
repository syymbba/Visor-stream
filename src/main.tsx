import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './lib/i18n';
import './index.css';

// Global error and unhandled promise rejection safety guard
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // Gracefully handle harmless rejections (e.g. video autoplay policy, aborted fetch, analytics)
    const reason = event?.reason?.message || event?.reason || '';
    if (
      typeof reason === 'string' &&
      (reason.includes('play()') ||
        reason.includes('The play() request was interrupted') ||
        reason.includes('AbortError') ||
        reason.includes('Failed to fetch') ||
        reason.includes('Load failed'))
    ) {
      event.preventDefault();
      return;
    }
    // Prevent unhandled promise crash
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    // Prevent noisy script errors from breaking rendering
    if (event?.message?.includes('ResizeObserver') || event?.message?.includes('Script error')) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);

