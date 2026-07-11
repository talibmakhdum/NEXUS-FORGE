'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

/**
 * Screen reader announcer for game events.
 * Uses aria-live regions to announce phase changes, wins, and captures
 * to assistive technology users.
 */
export default function ScreenReaderAnnouncer() {
  const { phase, currentPlayer, winner, moveHistory } = useGameStore();
  const [announcement, setAnnouncement] = useState('');

  // Track previous values to detect changes
  const [prevPhase, setPrevPhase] = useState(phase);
  const [prevWinner, setPrevWinner] = useState(winner);
  const [prevMoveCount, setPrevMoveCount] = useState(moveHistory.length);

  useEffect(() => {
    let message = '';

    // Announce winner
    if (winner !== prevWinner && winner) {
      if (winner === 'draw') {
        message = 'Game ended in a draw.';
      } else {
        message = `${winner} wins the game!`;
      }
    }
    // Announce phase changes
    else if (phase !== prevPhase) {
      switch (phase) {
        case 'forge':
          message = `Forge phase. ${currentPlayer}'s turn to place a stone.`;
          break;
        case 'echo':
          message = `Echo phase. ${currentPlayer}, select a piece to move.`;
          break;
        case 'pulse':
          message = 'Pulse phase. Resolving captures and checking win conditions.';
          break;
      }
    }
    // Announce capture (detected by piece removal — approximated by move count)
    else if (moveHistory.length > prevMoveCount) {
      const lastMove = moveHistory[moveHistory.length - 1];
      if (lastMove?.type === 'phase' && lastMove.toPhase === 'forge') {
        // Pulse resolved — potential capture occurred
        message = `Pulse resolved. ${currentPlayer}'s turn in forge phase.`;
      }
    }

    if (message) {
      setAnnouncement(message);
      // Clear announcement after screen reader has had time to read it
      const timer = setTimeout(() => setAnnouncement(''), 3000);
      return () => clearTimeout(timer);
    }

    // Update tracked values
    setPrevPhase(phase);
    setPrevWinner(winner);
    setPrevMoveCount(moveHistory.length);
  }, [phase, currentPlayer, winner, moveHistory, prevPhase, prevWinner, prevMoveCount]);

  return (
    <div
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {announcement}
    </div>
  );
}
