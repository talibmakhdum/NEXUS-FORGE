'use client';

import React, { useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line } from 'react-konva';
import { useGameStore } from '../store/gameStore';
import { Piece } from '../lib/types';
import { sounds } from '../lib/sounds';
import confetti from 'canvas-confetti';

const BOARD_SIZE = 13;
const CELL_SIZE = 32;
const PADDING = 20;
const WIDTH = (BOARD_SIZE - 1) * CELL_SIZE + PADDING * 2;

interface BoardKonvaProps {
  onError?: () => void;
}

export default function BoardKonva({ onError }: BoardKonvaProps) {
  const {
    pieces,
    currentPlayer,
    phase,
    placeStone,
    movePiece,
    selectPiece,
    selectedPieceId,
    winner
  } = useGameStore();

  const handleClick = (x: number, y: number) => {
    if (winner) return;

    // Haptic feedback on mobile
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
    sounds.unlock();

    if (phase === 'forge') {
      sounds.place();
      placeStone(x, y);
    } else if (phase === 'echo' && selectedPieceId) {
      const piece = pieces.find(p => p.id === selectedPieceId);
      if (piece) {
        const maxDist = piece.type === 'nexus' ? 2 : 3;
        const dist = Math.max(Math.abs(piece.x - x), Math.abs(piece.y - y));
        if (dist <= maxDist) {
          sounds.move();
          movePiece(selectedPieceId, x, y);
        }
      }
    }
  };

  const handlePieceClick = (piece: Piece) => {
    if (phase === 'echo' && piece.player === currentPlayer) {
      selectPiece(piece.id === selectedPieceId ? null : piece.id);
    }
  };

  // Visual power: Confetti on win (deferred if frame rate drops)
  useEffect(() => {
    if (winner) {
      // Use requestAnimationFrame to check frame rate before triggering confetti
      let frameCount = 0;
      const startTime = performance.now();

      const measureFrameRate = () => {
        frameCount++;
        const elapsed = performance.now() - startTime;

        if (elapsed >= 500) {
          // After 500ms, calculate average FPS
          const fps = frameCount / (elapsed / 1000);

          if (fps >= 45) {
            // Good frame rate — show confetti
            confetti({
              particleCount: fps >= 55 ? 250 : 100,
              spread: 120,
              origin: { y: 0.6 }
            });
          }
          // If FPS < 45, skip confetti to maintain performance

          if (winner !== 'draw') {
            try { sounds.nexusCapture(); } catch { /* non-critical */ }
          }
          return;
        }

        requestAnimationFrame(measureFrameRate);
      };

      requestAnimationFrame(measureFrameRate);
    }
  }, [winner]);

  // Report Konva errors to parent
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes('konva') ||
        event.message?.includes('react-konva')
      ) {
        onError?.();
      }
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);

  return (
    <div className="flex justify-center">
      <Stage
        width={WIDTH}
        height={WIDTH}
        className="konva-container rounded-3xl bg-[#0a0a0f] border border-[#00f0ff]/30 shadow-[0_0_60px_rgba(0,240,255,0.15)]"
      >
        <Layer>
          {/* Neon Grid */}
          {Array.from({ length: BOARD_SIZE }).map((_, i) => (
            <React.Fragment key={i}>
              <Line
                points={[PADDING, PADDING + i * CELL_SIZE, WIDTH - PADDING, PADDING + i * CELL_SIZE]}
                stroke="#334155"
                strokeWidth={1.5}
              />
              <Line
                points={[PADDING + i * CELL_SIZE, PADDING, PADDING + i * CELL_SIZE, WIDTH - PADDING]}
                stroke="#334155"
                strokeWidth={1.5}
              />
            </React.Fragment>
          ))}

          {/* Pieces with powerful glow */}
          {pieces.map((piece) => {
            const isSelected = piece.id === selectedPieceId;
            const color = piece.player === 'black' ? '#00f0ff' : '#ff00aa';

            return (
              <Circle
                key={piece.id}
                x={PADDING + piece.x * CELL_SIZE}
                y={PADDING + piece.y * CELL_SIZE}
                radius={piece.type === 'nexus' ? 15 : piece.type === 'forge' ? 12 : 9}
                fill={color}
                stroke="#fff"
                strokeWidth={isSelected ? 4 : 2}
                shadowColor={color}
                shadowBlur={piece.type === 'nexus' ? 28 : 18}
                shadowOpacity={0.95}
                onClick={() => handlePieceClick(piece)}
                onTap={() => handlePieceClick(piece)}
              />
            );
          })}

          {/* Clickable cells */}
          {Array.from({ length: BOARD_SIZE }).map((_, x) =>
            Array.from({ length: BOARD_SIZE }).map((_, y) => (
              <Rect
                key={`${x}-${y}`}
                x={PADDING + x * CELL_SIZE - 8}
                y={PADDING + y * CELL_SIZE - 8}
                width={16}
                height={16}
                fill="transparent"
                onClick={() => handleClick(x, y)}
                onTap={() => handleClick(x, y)}
              />
            ))
          )}
        </Layer>
      </Stage>
    </div>
  );
}
