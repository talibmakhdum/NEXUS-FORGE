'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { logError } from '../lib/error-logger';

// Dynamically import Konva board with error fallback
const KonvaBoard = dynamic(() => import('./BoardKonva'), {
  ssr: false,
  loading: () => <BoardSkeleton />,
});

// HTML Fallback board when Konva fails
const BoardFallback = dynamic(() => import('./BoardFallback'), {
  ssr: false,
  loading: () => <BoardSkeleton />,
});

/** Loading skeleton while board component loads */
function BoardSkeleton() {
  return (
    <div className="flex justify-center">
      <div
        className="rounded-3xl bg-[#0a0a0f] border border-[#00f0ff]/30 animate-pulse"
        style={{
          width: 424,
          height: 424,
          boxShadow: '0 0 60px rgba(0, 240, 255, 0.15)',
        }}
        aria-label="Loading game board..."
      />
    </div>
  );
}

/**
 * Board component with automatic Konva fallback.
 * Attempts to render the Konva canvas board, but falls back to
 * an HTML/CSS implementation if Konva fails to load.
 */
export default function Board() {
  const [konvaFailed, setKonvaFailed] = useState(false);

  useEffect(() => {
    // Detect if Konva failed to load by checking for module errors
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes('konva') ||
        event.message?.includes('react-konva') ||
        event.filename?.includes('konva')
      ) {
        setKonvaFailed(true);
        logError({
          error: event.error || 'Konva.js failed to load',
          component: 'Board:KonvaFallback',
          severity: 'warning',
          context: { filename: event.filename, message: event.message },
        });
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (konvaFailed) {
    return <BoardFallback />;
  }

  return (
    <React.Suspense fallback={<BoardSkeleton />}>
      <KonvaBoard onError={() => setKonvaFailed(true)} />
    </React.Suspense>
  );
}
