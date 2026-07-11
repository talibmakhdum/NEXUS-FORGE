'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

const RULES_CONTENT = `
NEXUS FORGE — Game Rules

OBJECTIVE
Win by either:
• Forming 5 of your stones in a row (horizontal, vertical, or diagonal)
• Capturing the opponent's Nexus (surrounding it so it has no liberties)

GAME FLOW (Three Phases)
1. FORGE — Place a standard stone on any empty intersection.
   Gain +1 Echo Energy per stone placed.

2. ECHO — Spend Echo Energy to move your pieces.
   • Standard pieces: move up to 3 cells
   • Nexus: move up to 2 cells
   • Forge stones: cannot move (they are anchors)

3. PULSE — Captures are resolved automatically.
   Opponent groups with zero liberties are captured.
   Captured stones grant +1 Echo Energy each.

ECHO ENERGY
• Starts at 5 for both players
• Max capacity: 15
• Gained by: placing stones (+1), capturing enemy stones (+1 per stone)
• Spent on: creating Forge stones (costs 3), moving pieces in Echo phase

FORGE STONES
Special stones that cost 3 Echo Energy.
They act as immovable anchors and count toward 5-in-a-row.

CAPTURE MECHANICS
Like Go: opponent stones with no empty adjacent intersections (liberties)
are captured and removed from the board.

TURN TIMER
Each turn has a 90-second time limit.
`;

export default function SettingsModal({ isOpen, onClose, onReset }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'rules'>('settings');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-[#111118] border border-white/20 rounded-3xl max-w-md w-full overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold tracking-widest">SETTINGS</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-3 text-xs tracking-widest font-bold transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#00f0ff]/30 ${
                  activeTab === 'settings'
                    ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                aria-selected={activeTab === 'settings'}
                role="tab"
              >
                SETTINGS
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`flex-1 py-3 text-xs tracking-widest font-bold transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#00f0ff]/30 ${
                  activeTab === 'rules'
                    ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                aria-selected={activeTab === 'rules'}
                role="tab"
              >
                RULES
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeTab === 'settings' ? (
                <div className="space-y-4">
                  {/* Sound Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold">Sound Effects</div>
                      <div className="text-xs text-gray-500">Enable audio feedback</div>
                    </div>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`relative w-12 h-6 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 ${
                        soundEnabled ? 'bg-[#00f0ff]' : 'bg-gray-600'
                      }`}
                      role="switch"
                      aria-checked={soundEnabled}
                      aria-label="Toggle sound effects"
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          soundEnabled ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10" />

                  {/* Reset Game */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-red-400">Reset Game</div>
                      <div className="text-xs text-gray-500">Start a fresh match</div>
                    </div>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold tracking-widest hover:bg-red-500/30 transition focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      aria-label="Reset game"
                    >
                      RESET
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                  {RULES_CONTENT}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
