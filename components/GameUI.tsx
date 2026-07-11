'use client';

import React from 'react';
import { useGameStore } from '../store/gameStore';
import EchoEnergyBar from './EchoEnergyBar';
import SettingsModal from './SettingsModal';

export default function GameUI() {
  const {
    currentPlayer,
    phase,
    echoEnergy,
    advancePhase,
    winner,
    undoMove,
    redoMove,
    moveHistory,
    resetGame,
  } = useGameStore();

  const [showSettings, setShowSettings] = React.useState(false);

  const playerColor = currentPlayer === 'black' ? 'cyan' : 'magenta';

  return (
    <>
      <div className="flex flex-col md:flex-row gap-3 mb-3 px-1">
        {/* Top Bar Info */}
        <div className="flex-1 flex items-center justify-between bg-[#111118] rounded-2xl px-5 py-3 border border-white/10">
          <div>
            <div className="text-xs tracking-widest text-gray-400">CURRENT PLAYER</div>
            <div
              className={`text-2xl font-bold ${playerColor === 'cyan' ? 'text-[#00f0ff]' : 'text-[#ff00aa]'}`}
              aria-live="polite"
              aria-label={`Current player: ${currentPlayer}`}
            >
              {currentPlayer.toUpperCase()}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-400">PHASE</div>
            <div
              className="font-mono text-xl tracking-[3px] phase-active text-[#00f0ff]"
              aria-live="polite"
              aria-label={`Current phase: ${phase}`}
            >
              {phase.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Echo Energy */}
        <div className="flex items-center gap-4 bg-[#111118] rounded-2xl p-3 border border-white/10">
          <EchoEnergyBar player="black" energy={echoEnergy.black} />
          <div className="text-center px-1">
            <div className="text-[10px] text-gray-400">ECHO</div>
            <div className="text-xs font-mono">VS</div>
          </div>
          <EchoEnergyBar player="white" energy={echoEnergy.white} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Undo */}
          <button
            onClick={undoMove}
            disabled={moveHistory.length === 0 || !!winner}
            className="px-3 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            aria-label="Undo last move"
            title="Undo (Ctrl+Z)"
          >
            ↩
          </button>

          {/* Main Phase Button */}
          <button
            onClick={advancePhase}
            disabled={!!winner}
            className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-[#00f0ff] to-[#4d9eff] text-black font-bold rounded-2xl text-sm tracking-widest active:scale-[0.985] transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={phase === 'pulse' ? 'Resolve pulse phase' : `End ${phase} phase`}
          >
            {phase === 'pulse' ? 'RESOLVE PULSE' : 'END ' + phase.toUpperCase()}
          </button>

          {/* Redo */}
          <button
            onClick={redoMove}
            disabled={!!winner}
            className="px-3 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            aria-label="Redo last move"
            title="Redo (Ctrl+Y)"
          >
            ↪
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            aria-label="Open settings"
            title="Settings"
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Phase-specific instruction */}
      <div className="sr-only" role="status" aria-live="polite">
        {phase === 'forge' && !winner && 'Forge phase: Click or press Enter to place a stone.'}
        {phase === 'echo' && !winner && 'Echo phase: Select a piece, then click destination or press Enter to move.'}
        {phase === 'pulse' && !winner && 'Pulse phase: Click Resolve Pulse to check captures and win conditions.'}
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onReset={resetGame}
      />
    </>
  );
}
