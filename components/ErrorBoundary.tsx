'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../lib/error-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError({
      error,
      component: errorInfo.componentStack?.split('\n')[1]?.trim() || 'Unknown',
      severity: 'critical',
      context: { errorInfo: errorInfo.componentStack },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
          <div className="bg-[#111118] border border-red-500/30 rounded-3xl p-10 text-center max-w-md w-full">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold tracking-widest mb-2 text-red-400">
              SYSTEM ERROR
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              A critical error occurred in the game engine. Your game state is preserved.
            </p>
            {this.state.error && (
              <div className="bg-black/50 rounded-xl p-4 mb-6 text-left overflow-auto max-h-32">
                <code className="text-xs text-red-300 font-mono">
                  {this.state.error.message}
                </code>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 bg-white text-black rounded-2xl font-bold tracking-widest text-sm hover:bg-gray-200 transition"
              >
                RETRY
              </button>
              <button
                onClick={() => typeof window !== 'undefined' && window.location.reload()}
                className="flex-1 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl font-bold tracking-widest text-sm hover:bg-red-500/30 transition"
              >
                REFRESH
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
