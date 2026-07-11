'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  player: 'black' | 'white';
  energy: number;
}

export default function EchoEnergyBar({ player, energy }: Props) {
  const color = player === 'black' ? '#00f0ff' : '#ff00aa';
  const height = (energy / 15) * 100;
  const [prevEnergy, setPrevEnergy] = useState(energy);

  useEffect(() => {
    if (energy > prevEnergy) {
      setPrevEnergy(energy);
    }
  }, [energy, prevEnergy]);

  return (
    <div className="relative w-7 h-28 bg-black/60 rounded-full overflow-hidden border border-white/20">
      <motion.div 
        className="energy-bar absolute bottom-0 left-0 w-full rounded-full"
        style={{ backgroundColor: color }}
        animate={{ height: `${height}%` }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      />
      
      {/* Intense particle emitters */}
      <AnimatePresence>
        {Array.from({ length: Math.min(Math.floor(energy / 1.8), 7) }).map((_, i) => (
          <motion.div 
            key={i}
            className="energy-particle"
            style={{
              left: `${18 + (i % 3) * 24}%`,
              background: color,
            }}
            animate={{
              y: [0, -75],
              opacity: [0.9, 0],
            }}
            transition={{
              duration: 0.9 + (i % 2) * 0.3,
              repeat: Infinity,
              delay: i * 0.12,
            }}
          />
        ))}
      </AnimatePresence>

      <div 
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono tracking-[2px] font-bold" 
        style={{ color }}
      >
        {energy}
      </div>
    </div>
  );
}
