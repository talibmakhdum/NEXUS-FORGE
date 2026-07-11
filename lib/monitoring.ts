/**
 * Monitoring & Analytics Stubs
 *
 * Provides stubs for Sentry error tracking and Google Analytics.
 * These are non-functional placeholders — to activate:
 *
 *   Sentry:    npm install @sentry/nextjs
 *   GA:        Add NEXT_PUBLIC_GA_ID to environment variables
 */

import { logError, logInfo } from './error-logger';

// ─── Sentry Stub ────────────────────────────────────────

/**
 * Initialize Sentry error tracking.
 * Stub: logs initialization intent.
 */
export function initSentry(): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    logInfo('Sentry not configured — set NEXT_PUBLIC_SENTRY_DSN to enable', 'monitoring:initSentry');
    return;
  }

  // When @sentry/nextjs is installed:
  // Sentry.init({ dsn, tracesSampleRate: 0.1 });

  logInfo('Sentry initialized (stub)', 'monitoring:initSentry');
}

/**
 * Capture an exception in Sentry.
 * Stub: logs to console with structured format.
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  logError({
    error,
    component: 'monitoring: captureException',
    severity: 'error',
    context,
  });

  // When @sentry/nextjs is installed:
  // Sentry.captureException(error, { extra: context });
}

/**
 * Capture a message in Sentry.
 * Stub: logs to console.
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  logError({
    error: message,
    component: 'monitoring: captureMessage',
    severity: level,
  });

  // When @sentry/nextjs is installed:
  // Sentry.captureMessage(message, level);
}

// ─── Google Analytics Stub ──────────────────────────────

/**
 * Track a gameplay event in Google Analytics.
 * Stub: logs event to console.
 *
 * Events:
 *   - game_started
 *   - stone_placed
 *   - piece_moved
 *   - phase_advanced
 *   - game_won
 *   - game_draw
 *   - settings_opened
 */
export function trackGameEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) {
    // GA not configured — silently skip
    return;
  }

  logInfo(`GA Event: ${eventName}`, 'monitoring:trackGameEvent', params);

  // When gtag is loaded:
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', eventName, { ...params, send_to: gaId });
  // }
}

/**
 * Initialize Google Analytics.
 * Stub: logs initialization intent.
 */
export function initGA(): void {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) {
    logInfo('Google Analytics not configured — set NEXT_PUBLIC_GA_ID to enable', 'monitoring:initGA');
    return;
  }

  logInfo('Google Analytics initialized (stub)', 'monitoring:initGA', { gaId });

  // When GA script is loaded:
  // gtag('config', gaId, { page_title: document.title, page_location: window.location.href });
}

// ─── Gameplay Event Helpers ─────────────────────────────

/** Track game start */
export function trackGameStart(player: string): void {
  trackGameEvent('game_started', { player });
}

/** Track stone placement */
export function trackStonePlaced(player: string, x: number, y: number): void {
  trackGameEvent('stone_placed', { player, x, y });
}

/** Track piece movement */
export function trackPieceMoved(player: string, pieceId: string, x: number, y: number): void {
  trackGameEvent('piece_moved', { player, pieceId, x, y });
}

/** Track phase advance */
export function trackPhaseAdvanced(from: string, to: string): void {
  trackGameEvent('phase_advanced', { from, to });
}

/** Track game win */
export function trackGameWon(winner: string, turns: number): void {
  trackGameEvent('game_won', { winner, turns });
}

/** Track game draw */
export function trackGameDraw(turns: number): void {
  trackGameEvent('game_draw', { turns });
}
