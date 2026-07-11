'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import GameUI from '../components/GameUI';
import WinModal from '../components/WinModal';
import ScreenReaderAnnouncer from '../components/ScreenReaderAnnouncer';
import ErrorBoundary from '../components/ErrorBoundary';
import { useGameStore } from '../store/gameStore';

const Board = dynamic(() => import('../components/Board'), { ssr: false });

export default function NexusForge() {
  const { resetGame } = useGameStore();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center p-2 md:p-6">
        <ScreenReaderAnnouncer />

        <div className="w-full max-w-[520px] md:max-w-[720px]">
          {/* Header */}
          <header className="flex items-center justify-between mb-4 px-2">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-[4px] neon-cyan" aria-label="NEXUS FORGE">
                NEXUS FORGE
              </h1>
              <p className="text-xs text-gray-400 tracking-[2px]">CYBER GO × CHESS × GOMOKU</p>
            </div>
            <button
              onClick={resetGame}
              className="px-4 py-1.5 text-sm bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
              aria-label="Start a new game"
            >
              NEW GAME
            </button>
          </header>

          {/* Main Game Area */}
          <main
            className="game-container relative bg-[#111118] rounded-3xl p-3 border border-white/10 shadow-2xl"
            role="application"
            aria-label="NEXUS FORGE game board"
          >
            <GameUI />
            <Board />
          </main>

          {/* Keyboard Controls Help */}
          <footer className="mt-3">
            <div className="text-center text-xs text-gray-500 mb-2">
              5-in-a-row • Capture Nexus • Fast 5–8 min matches
            </div>
            <KeyboardShortcuts />
          </footer>
        </div>

        <WinModal />
      </div>
    </ErrorBoundary>
  );
}

/** Keyboard shortcuts reference */
function KeyboardShortcuts() {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="text-center">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-[10px] text-gray-600 hover:text-gray-400 transition focus:outline-none focus:ring-1 focus:ring-[#00f0ff]/30 rounded px-2 py-1"
        aria-expanded={isExpanded}
        aria-controls="keyboard-help"
      >
        {isExpanded ? 'Hide' : 'Show'} Keyboard Controls
      </button>
      {isExpanded && (
        <div
          id="keyboard-help"
          className="mt-2 bg-[#111118] rounded-xl p-3 border border-white/5 text-left"
        >
          <h3 className="text-xs font-bold text-gray-400 mb-2 tracking-widest">CONTROLS</h3>
          <dl className="grid grid-cols-2 gap-1 text-[10px] text-gray-500">
            <dt className="font-mono text-[#00f0ff]">Arrow Keys</dt>
            <dd>Navigate board cells</dd>
            <dt className="font-mono text-[#00f0ff]">Enter / Space</dt>
            <dd>Place or select piece</dd>
            <dt className="font-mono text-[#00f0ff]">Escape</dt>
            <dd>Deselect / cancel</dd>
            <dt className="font-mono text-[#00f0ff]">Mouse</dt>
            <dd>Click to place or move</dd>
            <dt className="font-mono text-[#00f0ff]">Touch</dt>
            <dd>Tap to place or move</dd>
          </dl>
        </div>
      )}
    </div>
  );
}
