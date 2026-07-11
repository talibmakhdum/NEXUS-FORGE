import { Piece, Player, GameState, Move } from './types';

export const BOARD_SIZE = 13;

/** Maximum turns before draw is declared (13x13 board = 169 cells * 2 players) */
export const DRAW_THRESHOLD_TURNS = 169;

export function createInitialState(): GameState {
  const blackNexus: Piece = { id: 'black-nexus', player: 'black', type: 'nexus', x: 3, y: 6 };
  const whiteNexus: Piece = { id: 'white-nexus', player: 'white', type: 'nexus', x: 9, y: 6 };

  return {
    boardSize: BOARD_SIZE,
    pieces: [blackNexus, whiteNexus],
    currentPlayer: 'black',
    phase: 'forge',
    echoEnergy: { black: 5, white: 5 },
    moveHistory: [],
    winner: null,
    selectedPieceId: null,
    turnTimeLeft: 90,
  };
}

export function isValidPlacement(x: number, y: number, pieces: Piece[]): boolean {
  return !pieces.some(p => p.x === x && p.y === y);
}

export function getPieceAt(x: number, y: number, pieces: Piece[]) {
  return pieces.find(p => p.x === x && p.y === y);
}

export function getLiberties(x: number, y: number, pieces: Piece[]): number {
  const directions = [[-1,0],[1,0],[0,-1],[0,1]];
  let count = 0;
  for (const [dx, dy] of directions) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) continue;
    if (!getPieceAt(nx, ny, pieces)) count++;
  }
  return count;
}

export function checkCaptures(pieces: Piece[], player: Player): Piece[] {
  const opponent = player === 'black' ? 'white' : 'black';
  const opponentPieces = pieces.filter(p => p.player === opponent && p.type !== 'nexus');
  const toRemove: Piece[] = [];

  const visited = new Set<string>();

  function floodFill(piece: Piece): Piece[] {
    const group: Piece[] = [];
    const stack = [piece];
    const key = `${piece.x},${piece.y}`;
    visited.add(key);

    while (stack.length) {
      const current = stack.pop()!;
      group.push(current);

      const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
      for (const [dx, dy] of dirs) {
        const nx = current.x + dx, ny = current.y + dy;
        if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) continue;
        const neighbor = getPieceAt(nx, ny, pieces);
        if (neighbor && neighbor.player === opponent && !visited.has(`${nx},${ny}`)) {
          visited.add(`${nx},${ny}`);
          stack.push(neighbor);
        }
      }
    }
    return group;
  }

  for (const p of opponentPieces) {
    const key = `${p.x},${p.y}`;
    if (visited.has(key)) continue;
    const group = floodFill(p);
    const hasLiberty = group.some(g => getLiberties(g.x, g.y, pieces) > 0);
    if (!hasLiberty) toRemove.push(...group);
  }

  return toRemove;
}

export function checkFiveInARow(pieces: Piece[], player: Player): boolean {
  const playerPieces = pieces.filter(p => p.player === player);
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];

  for (const piece of playerPieces) {
    for (const [dx, dy] of dirs) {
      let count = 1;
      let cx = piece.x, cy = piece.y;

      for (let i = 0; i < 4; i++) {
        cx += dx; cy += dy;
        if (!playerPieces.some(p => p.x === cx && p.y === cy)) break;
        count++;
      }
      if (count === 5) return true;
    }
  }
  return false;
}

export function isNexusCaptured(nexus: Piece, pieces: Piece[]): boolean {
  return getLiberties(nexus.x, nexus.y, pieces) === 0;
}

/** Check if the board is completely full (no empty cells) */
export function isBoardFull(pieces: Piece[]): boolean {
  return pieces.length >= BOARD_SIZE * BOARD_SIZE;
}

/**
 * Check if a draw condition is met.
 * Draw occurs when:
 * - Board is completely full
 * - Excessive move count without conclusion
 */
export function checkDraw(pieces: Piece[], moveHistory: Move[]): boolean {
  if (isBoardFull(pieces)) return true;
  if (moveHistory.length >= DRAW_THRESHOLD_TURNS * 2) return true;
  return false;
}