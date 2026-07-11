import { describe, it, expect } from 'vitest';
import {
  BOARD_SIZE,
  createInitialState,
  isValidPlacement,
  getPieceAt,
  getLiberties,
  checkCaptures,
  checkFiveInARow,
  isNexusCaptured,
  isBoardFull,
  checkDraw,
  DRAW_THRESHOLD_TURNS,
} from './game-logic';
import { Piece, Player } from './types';

// ─── Helper: build a piece quickly ───
function p(
  x: number,
  y: number,
  player: Player = 'black',
  type: Piece['type'] = 'standard',
  id?: string
): Piece {
  return {
    id: id ?? `${player}-${type}-${x}-${y}`,
    player,
    type,
    x,
    y,
  };
}

// ─── Helper: build a nexus piece ───
function nexus(x: number, y: number, player: Player, id?: string): Piece {
  return p(x, y, player, 'nexus', id ?? `${player}-nexus`);
}

// ═══════════════════════════════════════════════════════════════
//  createInitialState
// ═══════════════════════════════════════════════════════════════
describe('createInitialState', () => {
  it('returns a 13x13 board', () => {
    const s = createInitialState();
    expect(s.boardSize).toBe(13);
  });

  it('places black nexus at (3,6) and white nexus at (9,6)', () => {
    const s = createInitialState();
    const blackNexus = s.pieces.find(p => p.player === 'black' && p.type === 'nexus');
    const whiteNexus = s.pieces.find(p => p.player === 'white' && p.type === 'nexus');
    expect(blackNexus).toBeDefined();
    expect(whiteNexus).toBeDefined();
    expect(blackNexus!.x).toBe(3);
    expect(blackNexus!.y).toBe(6);
    expect(whiteNexus!.x).toBe(9);
    expect(whiteNexus!.y).toBe(6);
  });

  it('starts with black as current player', () => {
    expect(createInitialState().currentPlayer).toBe('black');
  });

  it('starts in forge phase', () => {
    expect(createInitialState().phase).toBe('forge');
  });

  it('initializes echo energy to 5 for both players', () => {
    const s = createInitialState();
    expect(s.echoEnergy.black).toBe(5);
    expect(s.echoEnergy.white).toBe(5);
  });

  it('has empty move history', () => {
    expect(createInitialState().moveHistory).toEqual([]);
  });

  it('has no winner', () => {
    expect(createInitialState().winner).toBeNull();
  });

  it('has no selected piece', () => {
    expect(createInitialState().selectedPieceId).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
//  isValidPlacement
// ═══════════════════════════════════════════════════════════════
describe('isValidPlacement', () => {
  it('returns true for empty cell', () => {
    expect(isValidPlacement(0, 0, [])).toBe(true);
  });

  it('returns false when cell is occupied', () => {
    const pieces = [p(5, 5)];
    expect(isValidPlacement(5, 5, pieces)).toBe(false);
  });

  it('returns true when other cells are occupied', () => {
    const pieces = [p(5, 5), p(6, 6)];
    expect(isValidPlacement(0, 0, pieces)).toBe(true);
  });

  it('detects overlap with same coordinates different player', () => {
    const pieces = [p(5, 5, 'white')];
    expect(isValidPlacement(5, 5, pieces)).toBe(false);
  });

  it('detects overlap with nexus', () => {
    const pieces = [nexus(3, 6, 'black')];
    expect(isValidPlacement(3, 6, pieces)).toBe(false);
  });

  it('returns true at board boundaries (0,0)', () => {
    expect(isValidPlacement(0, 0, [])).toBe(true);
  });

  it('returns true at board boundaries (12,12)', () => {
    expect(isValidPlacement(12, 12, [])).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
//  getPieceAt
// ═══════════════════════════════════════════════════════════════
describe('getPieceAt', () => {
  it('finds piece at exact coordinates', () => {
    const piece = p(5, 5);
    expect(getPieceAt(5, 5, [piece])).toBe(piece);
  });

  it('returns undefined for empty cell', () => {
    expect(getPieceAt(0, 0, [])).toBeUndefined();
  });

  it('returns undefined when only other cells have pieces', () => {
    expect(getPieceAt(0, 0, [p(5, 5)])).toBeUndefined();
  });

  it('finds correct piece among many', () => {
    const pieces = [p(1, 1), p(2, 2), p(3, 3)];
    expect(getPieceAt(2, 2, pieces)).toEqual(p(2, 2));
  });
});

// ═══════════════════════════════════════════════════════════════
//  getLiberties
// ═══════════════════════════════════════════════════════════════
describe('getLiberties', () => {
  it('returns 4 liberties for isolated piece in center', () => {
    expect(getLiberties(6, 6, [])).toBe(4);
  });

  it('returns 3 liberties for piece at edge (0,6)', () => {
    expect(getLiberties(0, 6, [])).toBe(3);
  });

  it('returns 3 liberties for piece at edge (12,6)', () => {
    expect(getLiberties(12, 6, [])).toBe(3);
  });

  it('returns 3 liberties for piece at edge (6,0)', () => {
    expect(getLiberties(6, 0, [])).toBe(3);
  });

  it('returns 3 liberties for piece at edge (6,12)', () => {
    expect(getLiberties(6, 12, [])).toBe(3);
  });

  it('returns 2 liberties for piece at corner (0,0)', () => {
    expect(getLiberties(0, 0, [])).toBe(2);
  });

  it('returns 2 liberties for piece at corner (12,12)', () => {
    expect(getLiberties(12, 12, [])).toBe(2);
  });

  it('returns 2 liberties for piece at corner (0,12)', () => {
    expect(getLiberties(0, 12, [])).toBe(2);
  });

  it('returns 2 liberties for piece at corner (12,0)', () => {
    expect(getLiberties(12, 0, [])).toBe(2);
  });

  it('reduces liberties when adjacent cell is occupied', () => {
    const pieces = [p(6, 6), p(7, 6)];
    expect(getLiberties(6, 6, pieces)).toBe(3);
  });

  it('returns 0 when fully surrounded', () => {
    const pieces = [
      p(5, 5),
      p(6, 5),
      p(7, 5),
      p(5, 6),
      p(7, 6),
      p(5, 7),
      p(6, 7),
      p(7, 7),
    ];
    expect(getLiberties(6, 6, pieces)).toBe(0);
  });

  it('counts liberty through opponent piece (liberties are empty cells only)', () => {
    const pieces = [p(6, 6, 'black'), p(7, 6, 'white')];
    expect(getLiberties(6, 6, pieces)).toBe(3);
  });
});

// ═══════════════════════════════════════════════════════════════
//  checkCaptures
// ═══════════════════════════════════════════════════════════════
describe('checkCaptures', () => {
  // ── Basic capture: single stone with no liberties ──
  it('captures a single opponent stone with zero liberties', () => {
    const pieces: Piece[] = [
      nexus(3, 6, 'black'),
      p(5, 5, 'white'),
      p(5, 4, 'black'),
      p(5, 6, 'black'),
      p(4, 5, 'black'),
      p(6, 5, 'black'),
    ];
    const captured = checkCaptures(pieces, 'black');
    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({ x: 5, y: 5, player: 'white' });
  });

  it('does not capture stones that still have liberties', () => {
    const pieces: Piece[] = [
      nexus(3, 6, 'black'),
      p(5, 5, 'white'),
      p(5, 4, 'black'),
      p(5, 6, 'black'),
      p(4, 5, 'black'),
      // missing p(6,5) — the white stone at (5,5) still has liberty at (6,5)
    ];
    const captured = checkCaptures(pieces, 'black');
    expect(captured).toHaveLength(0);
  });

  // ── Atari: stone in atari (one liberty) is NOT captured yet ──
  it('does not capture stone in atari (single remaining liberty)', () => {
    const pieces: Piece[] = [
      nexus(3, 6, 'black'),
      p(5, 5, 'white'),
      p(5, 4, 'black'),
      p(5, 6, 'black'),
      p(4, 5, 'black'),
      // (6,5) is the last liberty — not filled
    ];
    const captured = checkCaptures(pieces, 'black');
    expect(captured).toHaveLength(0);
  });

  // ── Group capture: connected stones with shared liberties ──
  it('captures a connected group when the group has zero liberties', () => {
    const pieces: Piece[] = [
      nexus(3, 6, 'black'),
      // Connected white group of 2
      p(5, 5, 'white'),
      p(5, 6, 'white'),
      // Surrounding black stones
      p(5, 4, 'black'),
      p(4, 5, 'black'),
      p(6, 5, 'black'),
      p(4, 6, 'black'),
      p(6, 6, 'black'),
      p(5, 7, 'black'),
    ];
    const captured = checkCaptures(pieces, 'black');
    expect(captured).toHaveLength(2);
    expect(captured.map(c => ({ x: c.x, y: c.y }))).toContainEqual({ x: 5, y: 5 });
    expect(captured.map(c => ({ x: c.x, y: c.y }))).toContainEqual({ x: 5, y: 6 });
  });

  it('does not capture a connected group that still has shared liberties', () => {
    const pieces: Piece[] = [
      nexus(3, 6, 'black'),
      p(5, 5, 'white'),
      p(5, 6, 'white'),
      p(5, 4, 'black'),
      p(4, 5, 'black'),
      p(6, 5, 'black'),
      p(4, 6, 'black'),
      // p(6,6) missing — group still has liberty at (6,6)
      p(5, 7, 'black'),
    ];
    const captured = checkCaptures(pieces, 'black');
    expect(captured).toHaveLength(0);
  });

  // ── Multiple separate groups, some captured ──
  it('captures multiple separate groups each with zero liberties', () => {
    const pieces: Piece[] = [
      nexus(3, 6, 'black'),
      // First white group at (5,5)
      p(5, 5, 'white'),
      p(5, 4, 'black'),
      p(5, 6, 'black'),
      p(4, 5, 'black'),
      p(6, 5, 'black'),
      // Second white group at (8,8)
      p(8, 8, 'white'),
      p(8, 7, 'black'),
      p(8, 9, 'black'),
      p(7, 8, 'black'),
      p(9, 8, 'black'),
    ];
    const captured = checkCaptures(pieces, 'black');
    expect(captured).toHaveLength(2);
  });

  it('captures only the zero-liberty group, not a group with liberties', () => {
    const pieces: Piece[] = [
      nexus(3, 6, 'black'),
      // Captured group at (5,5)
      p(5, 5, 'white'),
      p(5, 4, 'black'),
      p(5, 6, 'black'),
      p(4, 5, 'black'),
      p(6, 5, 'black'),
      // Free group at (8,8) — no surrounding stones
      p(8, 8, 'white'),
    ];
    const captured = checkCaptures(pieces, 'black');
    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({ x: 5, y: 5 });
  });

  // ── Self-capture prevention (should not be checked here) ──
  it('checks opponent pieces, not current player pieces', () => {
    const pieces: Piece[] = [
      nexus(3, 6, 'black'),
      p(5, 5, 'black'),
      p(5, 4, 'white'),
      p(5, 6, 'white'),
      p(4, 5, 'white'),
      p(6, 5, 'white'),
    ];
    // Checking from white's perspective — black stone at (5,5) has no liberties
    const captured = checkCaptures(pieces, 'white');
    expect(captured).toHaveLength(1);
    expect(captured[0].player).toBe('black');
  });

  // ── Nexus is never captured by checkCaptures (only by isNexusCaptured) ──
  it('does not include nexus pieces in capture check', () => {
    const pieces: Piece[] = [
      // White nexus surrounded by black
      nexus(5, 5, 'white'),
      p(5, 4, 'black'),
      p(5, 6, 'black'),
      p(4, 5, 'black'),
      p(6, 5, 'black'),
    ];
    const captured = checkCaptures(pieces, 'black');
    // Nexus is filtered out by type !== 'nexus'
    expect(captured).toHaveLength(0);
  });

  // ── Forge pieces can be captured ──
  it('captures forge-type opponent pieces', () => {
    const pieces: Piece[] = [
      nexus(3, 6, 'black'),
      p(5, 5, 'white', 'forge'),
      p(5, 4, 'black'),
      p(5, 6, 'black'),
      p(4, 5, 'black'),
      p(6, 5, 'black'),
    ];
    const captured = checkCaptures(pieces, 'black');
    expect(captured).toHaveLength(1);
    expect(captured[0].type).toBe('forge');
  });

  // ── Edge/corner captures ──
  it('captures stone at corner (0,0) with no liberties', () => {
    const pieces: Piece[] = [
      nexus(3, 6, 'black'),
      p(0, 0, 'white'),
      p(1, 0, 'black'),
      p(0, 1, 'black'),
    ];
    const captured = checkCaptures(pieces, 'black');
    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({ x: 0, y: 0 });
  });

  it('captures stone at edge with no liberties', () => {
    const pieces: Piece[] = [
      nexus(3, 6, 'black'),
      p(0, 5, 'white'),
      p(0, 4, 'black'),
      p(0, 6, 'black'),
      p(1, 5, 'black'),
    ];
    const captured = checkCaptures(pieces, 'black');
    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({ x: 0, y: 5 });
  });

  // ── Large group capture (stress test) ──
  it('captures a large connected group of 10+ stones', () => {
    const pieces: Piece[] = [
      nexus(3, 6, 'black'),
      // Create a 2x5 block of white stones
      ...[0, 1].flatMap(dx =>
        [5, 6, 7, 8, 9].map(dy => p(5 + dx, dy, 'white'))
      ),
      // Surround the block
      p(4, 5, 'black'), p(4, 6, 'black'), p(4, 7, 'black'), p(4, 8, 'black'), p(4, 9, 'black'),
      p(7, 5, 'black'), p(7, 6, 'black'), p(7, 7, 'black'), p(7, 8, 'black'), p(7, 9, 'black'),
      p(5, 4, 'black'), p(6, 4, 'black'),
      p(5, 10, 'black'), p(6, 10, 'black'),
    ];
    const captured = checkCaptures(pieces, 'black');
    expect(captured).toHaveLength(10);
  });

  // ── Empty board / no opponent pieces ──
  it('returns empty array when no opponent pieces exist', () => {
    const pieces: Piece[] = [nexus(3, 6, 'black')];
    expect(checkCaptures(pieces, 'black')).toEqual([]);
  });

  it('returns empty array for empty pieces array', () => {
    expect(checkCaptures([], 'black')).toEqual([]);
  });

  // ── Chain of captures (cascading would need recursion) ──
  it('handles a snake-like group correctly', () => {
    const pieces: Piece[] = [
      nexus(3, 6, 'black'),
      // Snake: (5,5)-(5,6)-(6,6)-(6,7)
      p(5, 5, 'white'),
      p(5, 6, 'white'),
      p(6, 6, 'white'),
      p(6, 7, 'white'),
      // Surround the snake
      p(5, 4, 'black'), p(6, 4, 'black'),
      p(4, 5, 'black'), p(4, 6, 'black'),
      p(7, 6, 'black'), p(7, 7, 'black'),
      p(5, 7, 'black'),
      p(6, 8, 'black'),
    ];
    const captured = checkCaptures(pieces, 'black');
    expect(captured).toHaveLength(4);
  });
});

// ═══════════════════════════════════════════════════════════════
//  checkFiveInARow
// ═══════════════════════════════════════════════════════════════
describe('checkFiveInARow', () => {
  it('detects horizontal 5-in-a-row', () => {
    const pieces = [
      nexus(3, 6, 'black'),
      ...[0, 1, 2, 3, 4].map(x => p(x, 5, 'black')),
    ];
    expect(checkFiveInARow(pieces, 'black')).toBe(true);
  });

  it('detects vertical 5-in-a-row', () => {
    const pieces = [
      nexus(3, 6, 'black'),
      ...[0, 1, 2, 3, 4].map(y => p(5, y, 'black')),
    ];
    expect(checkFiveInARow(pieces, 'black')).toBe(true);
  });

  it('detects diagonal (/) 5-in-a-row', () => {
    const pieces = [
      nexus(3, 6, 'black'),
      ...[0, 1, 2, 3, 4].map(i => p(i, i, 'black')),
    ];
    expect(checkFiveInARow(pieces, 'black')).toBe(true);
  });

  it('detects diagonal (\\) 5-in-a-row', () => {
    const pieces = [
      nexus(3, 6, 'black'),
      ...[0, 1, 2, 3, 4].map(i => p(4 - i, i, 'black')),
    ];
    expect(checkFiveInARow(pieces, 'black')).toBe(true);
  });

  it('returns false for 4-in-a-row', () => {
    const pieces = [
      nexus(3, 6, 'black'),
      ...[0, 1, 2, 3].map(x => p(x, 5, 'black')),
    ];
    expect(checkFiveInARow(pieces, 'black')).toBe(false);
  });

  it('returns false for disconnected 5 stones', () => {
    const pieces = [
      nexus(3, 6, 'black'),
      p(0, 5, 'black'),
      p(2, 5, 'black'),
      p(4, 5, 'black'),
      p(6, 5, 'black'),
      p(8, 5, 'black'),
    ];
    expect(checkFiveInARow(pieces, 'black')).toBe(false);
  });

  it('does not count opponent stones', () => {
    const pieces = [
      nexus(3, 6, 'black'),
      ...[0, 1, 2, 3, 4].map(x => p(x, 5, 'white')),
    ];
    expect(checkFiveInARow(pieces, 'black')).toBe(false);
  });

  it('detects 5-in-a-row for white', () => {
    const pieces = [
      nexus(3, 6, 'black'),
      ...[0, 1, 2, 3, 4].map(x => p(x, 5, 'white')),
    ];
    expect(checkFiveInARow(pieces, 'white')).toBe(true);
  });

  it('returns false for empty board', () => {
    expect(checkFiveInARow([], 'black')).toBe(false);
  });

  it('detects 5-in-a-row with mixed piece types', () => {
    const pieces = [
      nexus(3, 6, 'black'),
      p(0, 5, 'black', 'standard'),
      p(1, 5, 'black', 'forge'),
      p(2, 5, 'black', 'standard'),
      p(3, 5, 'black', 'forge'),
      p(4, 5, 'black', 'standard'),
    ];
    expect(checkFiveInARow(pieces, 'black')).toBe(true);
  });

  it('does not count nexus as part of 5-in-a-row (nexus has separate win condition)', () => {
    const pieces = [
      nexus(3, 6, 'black'),
      p(0, 5, 'black'),
      p(1, 5, 'black'),
      p(2, 5, 'black'),
      p(4, 5, 'black'),
    ];
    // Nexus at (3,6) is not in the line, so no 5-in-a-row
    expect(checkFiveInARow(pieces, 'black')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
//  isNexusCaptured
// ═══════════════════════════════════════════════════════════════
describe('isNexusCaptured', () => {
  it('returns true when nexus has 0 liberties', () => {
    const nexusPiece = nexus(5, 5, 'white');
    const pieces: Piece[] = [
      nexusPiece,
      p(5, 4, 'black'),
      p(5, 6, 'black'),
      p(4, 5, 'black'),
      p(6, 5, 'black'),
    ];
    expect(isNexusCaptured(nexusPiece, pieces)).toBe(true);
  });

  it('returns false when nexus has liberties', () => {
    const nexusPiece = nexus(5, 5, 'white');
    const pieces: Piece[] = [
      nexusPiece,
      p(5, 4, 'black'),
      p(5, 6, 'black'),
      p(4, 5, 'black'),
      // p(6,5) missing — nexus still has liberty at (6,5)
    ];
    expect(isNexusCaptured(nexusPiece, pieces)).toBe(false);
  });

  it('returns false for nexus at corner with 2 open edges', () => {
    const nexusPiece = nexus(0, 0, 'white');
    const pieces: Piece[] = [nexusPiece];
    // Corner has 2 liberties by default (off-board doesn't count)
    expect(isNexusCaptured(nexusPiece, pieces)).toBe(false);
  });

  it('returns true for nexus at edge when surrounded', () => {
    const nexusPiece = nexus(0, 5, 'white');
    const pieces: Piece[] = [
      nexusPiece,
      p(0, 4, 'black'),
      p(0, 6, 'black'),
      p(1, 5, 'black'),
    ];
    expect(isNexusCaptured(nexusPiece, pieces)).toBe(true);
  });

  it('nexus liberties are reduced by friendly pieces', () => {
    const nexusPiece = nexus(5, 5, 'white');
    const pieces: Piece[] = [
      nexusPiece,
      p(5, 4, 'white'),  // friendly piece blocks one liberty
      p(5, 6, 'black'),
      p(4, 5, 'black'),
      p(6, 5, 'black'),
    ];
    // Nexus liberties: up=(5,4) occupied by friendly, down=(5,6) enemy, left=(4,5) enemy, right=(6,5) enemy
    // Liberty count = 0 (own piece doesn't provide liberty)
    expect(isNexusCaptured(nexusPiece, pieces)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
//  isBoardFull
// ═══════════════════════════════════════════════════════════════
describe('isBoardFull', () => {
  it('returns false for empty board', () => {
    expect(isBoardFull([])).toBe(false);
  });

  it('returns false for board with some pieces', () => {
    const pieces = Array.from({ length: 10 }, (_, i) => p(i % 13, Math.floor(i / 13), 'black'));
    expect(isBoardFull(pieces)).toBe(false);
  });

  it('returns true when board is full (169 pieces)', () => {
    const pieces: Piece[] = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        pieces.push(p(x, y, (x + y) % 2 === 0 ? 'black' : 'white'));
      }
    }
    expect(pieces.length).toBe(169);
    expect(isBoardFull(pieces)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
//  checkDraw
// ═══════════════════════════════════════════════════════════════
describe('checkDraw', () => {
  it('returns false for initial state', () => {
    const state = createInitialState();
    expect(checkDraw(state.pieces, state.moveHistory)).toBe(false);
  });

  it('returns true when board is full', () => {
    const pieces: Piece[] = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        pieces.push(p(x, y, (x + y) % 2 === 0 ? 'black' : 'white'));
      }
    }
    expect(checkDraw(pieces, [])).toBe(true);
  });

  it('returns false for moderate move count', () => {
    const pieces = [nexus(3, 6, 'black'), nexus(9, 6, 'white'), p(0, 0, 'black')];
    const moves: Move[] = [
      { player: 'black', type: 'place', x: 0, y: 0, pieceId: 'test-1' },
      { player: 'white', type: 'place', x: 1, y: 0, pieceId: 'test-2' },
    ];
    expect(checkDraw(pieces, moves)).toBe(false);
  });

  it('returns true when move history exceeds threshold', () => {
    const pieces = [nexus(3, 6, 'black'), nexus(9, 6, 'white')];
    const moves: Move[] = Array.from({ length: DRAW_THRESHOLD_TURNS * 2 }, (_, i) => ({
      player: (i % 2 === 0 ? 'black' : 'white') as Player,
      type: 'place' as const,
      x: i % 13,
      y: Math.floor(i / 13) % 13,
      pieceId: `test-${i}`,
    }));
    expect(checkDraw(pieces, moves)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
//  Integration: realistic game scenarios
// ═══════════════════════════════════════════════════════════════
describe('Integration scenarios', () => {
  it('complete game: placement → capture → win by nexus capture', () => {
    // Simulate black surrounding white nexus and capturing it
    const pieces: Piece[] = [
      nexus(5, 5, 'white'),
      p(5, 4, 'black'),
      p(5, 6, 'black'),
      p(4, 5, 'black'),
      p(6, 5, 'black'),
    ];

    const captured = checkCaptures(pieces, 'black');
    expect(captured).toHaveLength(0); // nexus not captured by checkCaptures

    const nexusCaptured = isNexusCaptured(pieces[0], pieces);
    expect(nexusCaptured).toBe(true);
  });

  it('game continues when no captures and no 5-in-a-row', () => {
    const pieces: Piece[] = [
      nexus(3, 6, 'black'),
      nexus(9, 6, 'white'),
      p(0, 0, 'black'),
      p(12, 12, 'white'),
    ];

    expect(checkCaptures(pieces, 'black')).toHaveLength(0);
    expect(checkFiveInARow(pieces, 'black')).toBe(false);
    expect(isNexusCaptured(pieces[1]!, pieces)).toBe(false);
  });

  it('player wins with 5-in-a-row even if opponent has uncaptured nexus', () => {
    const pieces: Piece[] = [
      nexus(3, 6, 'black'),
      nexus(9, 6, 'white'),
      ...[0, 1, 2, 3, 4].map(x => p(x, 5, 'black')),
    ];

    expect(checkFiveInARow(pieces, 'black')).toBe(true);
    expect(isNexusCaptured(pieces[1]!, pieces)).toBe(false);
  });
});
