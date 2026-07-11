export type Severity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorLogEntry {
  timestamp: string;
  error: string;
  component: string;
  severity: Severity;
  stack?: string;
  context?: Record<string, unknown>;
}

interface LogOptions {
  error: Error | string;
  component: string;
  severity: Severity;
  context?: Record<string, unknown>;
}

/**
 * Logs errors to console with structured format.
 * Format: { timestamp, error, component, severity, ...context }
 */
export function logError(options: LogOptions): ErrorLogEntry {
  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    error: options.error instanceof Error ? options.error.message : options.error,
    component: options.component,
    severity: options.severity,
    stack: options.error instanceof Error ? options.error.stack : undefined,
    context: options.context,
  };

  // Log to console with structured format
  const consoleMethod =
    options.severity === 'critical'
      ? console.error
      : options.severity === 'error'
        ? console.error
        : options.severity === 'warning'
          ? console.warn
          : console.log;

  consoleMethod(`[NEXUS FORGE] ${options.severity.toUpperCase()}`, entry);

  // In production, you would send this to Sentry or similar service
  if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__SENTRY__) {
    // Sentry integration stub — would call Sentry.captureException() here
  }

  return entry;
}

/**
 * Log a warning-level message
 */
export function logWarning(message: string, component: string, context?: Record<string, unknown>) {
  return logError({ error: message, component, severity: 'warning', context });
}

/**
 * Log an info-level message
 */
export function logInfo(message: string, component: string, context?: Record<string, unknown>) {
  return logError({ error: message, component, severity: 'info', context });
}
