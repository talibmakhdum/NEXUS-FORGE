'use client';

import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function WinModal() {
  const { winner, resetGame } = useGameStore();

  if (!winner) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#111118] border border-white/20 rounded-3xl p-10 text-center max-w-xs w-full mx-4"
        >
          <div className="text-6xl mb-3">🏆</div>
          <h2 className="text-4xl font-bold tracking-widest mb-2">
            {winner === 'draw' ? 'DRAW' : `${winner.toUpperCase()} WINS`}
          </h2>
          <p className="text-gray-400 mb-8">Incredible match!</p>
          
          <div className="flex gap-3">
            <button 
              onClick={resetGame}
              className="flex-1 py-4 bg-white text-black rounded-2xl font-bold tracking-widest"
            >
              REMATCH
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
