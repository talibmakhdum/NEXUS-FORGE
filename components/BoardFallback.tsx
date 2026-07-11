'use client';

import React, { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { Piece } from '../lib/types';
import { sounds } from '../lib/sounds';
import confetti from 'canvas-confetti';

const BOARD_SIZE = 13;
const CELL_SIZE = 32;
const PADDING = 20;
const WIDTH = (BOARD_SIZE - 1) * CELL_SIZE + PADDING * 2;

/**
 * HTML/CSS fallback board rendered when Konva.js fails to load.
 * Provides identical gameplay functionality using standard DOM elements.
 * Includes full keyboard navigation for accessibility.
 */
export default function BoardFallback() {
  const {
    pieces,
    currentPlayer,
    phase,
    placeStone,
    movePiece,
    selectPiece,
    selectedPieceId,
    winner,
  } = useGameStore();

  // Track focused cell for keyboard navigation
  const [focusedCell, setFocusedCell] = useState({ x: 6, y: 6 });
  const boardRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Trigger confetti on win
  useEffect(() => {
    if (winner) {
      requestAnimationFrame(() => {
        confetti({
          particleCount: 250,
          spread: 120,
          origin: { y: 0.6 },
        });
        if (winner !== 'draw') {
          try { sounds.nexusCapture(); } catch { /* non-critical */ }
        }
      });
    }
  }, [winner]);

  const handleCellClick = useCallback((x: number, y: number) => {
    if (winner) return;

    // Haptic feedback on mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
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
  }, [phase, selectedPieceId, pieces, winner, placeStone, movePiece]);

  const handlePieceClick = useCallback((piece: Piece, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (phase === 'echo' && piece.player === currentPlayer) {
      selectPiece(piece.id === selectedPieceId ? null : piece.id);
    }
  }, [phase, currentPlayer, selectedPieceId, selectPiece]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (winner) return;

    const { x, y } = focusedCell;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setFocusedCell({ x, y: Math.max(0, y - 1) });
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedCell({ x, y: Math.min(BOARD_SIZE - 1, y + 1) });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedCell({ x: Math.max(0, x - 1), y });
        break;
      case 'ArrowRight':
        e.preventDefault();
        setFocusedCell({ x: Math.min(BOARD_SIZE - 1, x + 1), y });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        {
          const pieceAtCell = pieces.find(p => p.x === x && p.y === y);
          if (phase === 'echo' && pieceAtCell && pieceAtCell.player === currentPlayer) {
            // Select/deselect piece
            handlePieceClick(pieceAtCell, e);
          } else if (phase === 'forge' || (phase === 'echo' && selectedPieceId)) {
            // Place or move to cell
            handleCellClick(x, y);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (selectedPieceId) {
          selectPiece(null);
        }
        break;
    }
  }, [focusedCell, winner, phase, pieces, currentPlayer, selectedPieceId, handleCellClick, handlePieceClick, selectPiece]);

  // Focus the currently focused cell
  useEffect(() => {
    const key = `${focusedCell.x}-${focusedCell.y}`;
    const cell = cellRefs.current.get(key);
    if (cell) {
      cell.focus();
    }
  }, [focusedCell]);

  // Build grid cells
  const cells = useMemo(() => {
    const result: { x: number; y: number }[] = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        result.push({ x, y });
      }
    }
    return result;
  }, []);

  return (
    <div className="flex justify-center">
      <div
        ref={boardRef}
        className="relative rounded-3xl bg-[#0a0a0f] border border-[#00f0ff]/30 outline-none"
        style={{
          width: WIDTH,
          height: WIDTH,
          boxShadow: '0 0 60px rgba(0, 240, 255, 0.15)',
        }}
        role="grid"
        aria-label={`NEXUS FORGE game board, 13 by 13 grid. Current phase: ${phase}. Current player: ${currentPlayer}.`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* SVG Grid Lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={WIDTH}
          height={WIDTH}
          aria-hidden="true"
        >
          {Array.from({ length: BOARD_SIZE }).map((_, i) => (
            <React.Fragment key={`grid-${i}`}>
              <line
                x1={PADDING}
                y1={PADDING + i * CELL_SIZE}
                x2={WIDTH - PADDING}
                y2={PADDING + i * CELL_SIZE}
                stroke="#334155"
                strokeWidth={1.5}
              />
              <line
                x1={PADDING + i * CELL_SIZE}
                y1={PADDING}
                x2={PADDING + i * CELL_SIZE}
                y2={WIDTH - PADDING}
                stroke="#334155"
                strokeWidth={1.5}
              />
            </React.Fragment>
          ))}
        </svg>

        {/* Clickable cells */}
        {cells.map(({ x, y }) => {
          const isFocused = focusedCell.x === x && focusedCell.y === y;
          const pieceAtCell = pieces.find(p => p.x === x && p.y === y);
          const isEmpty = !pieceAtCell;

          return (
            <button
              key={`cell-${x}-${y}`}
              ref={(el) => {
                if (el) cellRefs.current.set(`${x}-${y}`, el);
              }}
              className={`absolute rounded-sm transition-colors focus:outline-none ${
                isFocused
                  ? 'bg-[#00f0ff]/20 ring-2 ring-[#00f0ff]/60'
                  : 'bg-transparent hover:bg-white/5'
              }`}
              style={{
                left: PADDING + x * CELL_SIZE - CELL_SIZE / 2,
                top: PADDING + y * CELL_SIZE - CELL_SIZE / 2,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
              onClick={() => handleCellClick(x, y)}
              onFocus={() => setFocusedCell({ x, y })}
              aria-label={`Cell ${x + 1}, ${y + 1}${pieceAtCell ? `, ${pieceAtCell.player} ${pieceAtCell.type}` : ', empty'}`}
              aria-selected={isFocused}
              data-x={x}
              data-y={y}
              role="gridcell"
            />
          );
        })}

        {/* Pieces (rendered on top of cells) */}
        {pieces.map((piece) => {
          const isSelected = piece.id === selectedPieceId;
          const color = piece.player === 'black' ? '#00f0ff' : '#ff00aa';
          const radius = piece.type === 'nexus' ? 15 : piece.type === 'forge' ? 12 : 9;

          return (
            <button
              key={piece.id}
              className="absolute rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 transition-transform hover:scale-110"
              style={{
                left: PADDING + piece.x * CELL_SIZE - radius,
                top: PADDING + piece.y * CELL_SIZE - radius,
                width: radius * 2,
                height: radius * 2,
                backgroundColor: color,
                border: isSelected ? '3px solid #fff' : '2px solid rgba(255,255,255,0.8)',
                boxShadow: `0 0 ${piece.type === 'nexus' ? 28 : 18}px ${color}`,
              }}
              onClick={(e) => handlePieceClick(piece, e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePieceClick(piece, e);
                }
              }}
              tabIndex={-1}
              aria-label={`${piece.player} ${piece.type} piece at ${piece.x + 1}, ${piece.y + 1}${isSelected ? ', selected' : ''}`}
              aria-pressed={isSelected}
            />
          );
        })}
      </div>
    </div>
  );
}
