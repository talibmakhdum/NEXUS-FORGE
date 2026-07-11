export type Player = 'black' | 'white';
export type PieceType = 'standard' | 'forge' | 'nexus';

export interface Piece {
  id: string;
  player: Player;
  type: PieceType;
  x: number;
  y: number;
}

/** A move where a player places a new stone on the board */
export interface MovePlace {
  player: Player;
  type: 'place' | 'forge';
  x: number;
  y: number;
  /** Snapshot of the piece created (for undo) */
  pieceId: string;
}

/** A move where a player moves an existing piece */
export interface MoveMove {
  player: Player;
  type: 'move';
  pieceId: string;
  x: number;
  y: number;
  /** Previous position (for undo) */
  fromX: number;
  fromY: number;
}

/** A phase advance action recorded in history */
export interface MovePhase {
  player: Player;
  type: 'phase';
  fromPhase: Phase;
  toPhase: Phase;
}

/** Union of all move types for history tracking */
export type Move = MovePlace | MoveMove | MovePhase;

export type Phase = 'forge' | 'echo' | 'pulse';

export interface GameState {
  boardSize: number;
  pieces: Piece[];
  currentPlayer: Player;
  phase: Phase;
  echoEnergy: { black: number; white: number };
  moveHistory: Move[];
  winner: Player | 'draw' | null;
  selectedPieceId: string | null;
  turnTimeLeft: number;
}

/** Full game state snapshot for undo/redo */
export interface StateSnapshot {
  pieces: Piece[];
  currentPlayer: Player;
  phase: Phase;
  echoEnergy: { black: number; white: number };
  moveHistory: Move[];
  winner: Player | 'draw' | null;
  selectedPieceId: string | null;
}
