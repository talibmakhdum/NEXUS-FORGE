import { create } from 'zustand';
import { GameState, Piece, Player, Move, Phase, StateSnapshot } from '../lib/types';
import { createInitialState, isValidPlacement, checkCaptures, checkFiveInARow, isNexusCaptured, BOARD_SIZE } from '../lib/game-logic';
import { sounds } from '../lib/sounds';

const DRAW_THRESHOLD_TURNS = 169; // 13x13 board = 169 cells

interface GameStore extends GameState {
  placeStone: (x: number, y: number) => void;
  movePiece: (pieceId: string, x: number, y: number) => void;
  createForgeStone: (x: number, y: number) => void;
  advancePhase: () => void;
  resetGame: () => void;
  undoMove: () => void;
  redoMove: () => void;
  selectPiece: (id: string | null) => void;
}

/** Deep clone pieces array for snapshotting */
function clonePieces(pieces: Piece[]): Piece[] {
  return pieces.map(p => ({ ...p }));
}

/** Create a state snapshot for undo/redo */
function createSnapshot(state: GameState): StateSnapshot {
  return {
    pieces: clonePieces(state.pieces),
    currentPlayer: state.currentPlayer,
    phase: state.phase,
    echoEnergy: { ...state.echoEnergy },
    moveHistory: [...state.moveHistory],
    winner: state.winner,
    selectedPieceId: state.selectedPieceId,
  };
}

/** Check if the board is completely full */
function isBoardFull(pieces: Piece[]): boolean {
  return pieces.length >= BOARD_SIZE * BOARD_SIZE;
}

/** Check if a draw condition is met */
function checkDraw(pieces: Piece[], moveHistory: Move[]): boolean {
  // Board is full
  if (isBoardFull(pieces)) return true;

  // No valid moves possible (all cells occupied)
  if (pieces.length >= BOARD_SIZE * BOARD_SIZE) return true;

  // Excessive move count without conclusion
  if (moveHistory.length >= DRAW_THRESHOLD_TURNS * 2) return true;

  return false;
}

/** Valid phase transitions */
const VALID_PHASE_TRANSITIONS: Record<Phase, Phase[]> = {
  forge: ['echo'],
  echo: ['pulse'],
  pulse: ['forge'],
};

/** Validate phase transition */
function isValidPhaseTransition(from: Phase, to: Phase): boolean {
  return VALID_PHASE_TRANSITIONS[from]?.includes(to) ?? false;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  placeStone: (x, y) => {
    const { pieces, currentPlayer, phase, echoEnergy, winner } = get();
    if (phase !== 'forge' || !isValidPlacement(x, y, pieces) || winner) return;

    const pieceId = `standard-${Date.now()}-${x}-${y}`;
    const newPiece: Piece = {
      id: pieceId,
      player: currentPlayer,
      type: 'standard',
      x, y,
    };

    const newPieces = [...pieces, newPiece];
    const newEnergy = { ...echoEnergy };
    newEnergy[currentPlayer] = Math.min(15, newEnergy[currentPlayer] + 1);

    const move: Move = {
      player: currentPlayer,
      type: 'place',
      x, y,
      pieceId,
    };

    try {
      sounds.place();
    } catch {
      // Audio not critical — continue silently
    }

    set({
      pieces: newPieces,
      echoEnergy: newEnergy,
      moveHistory: [...get().moveHistory, move],
    });
  },

  movePiece: (pieceId, x, y) => {
    const state = get();
    const piece = state.pieces.find(p => p.id === pieceId);
    if (!piece || state.phase !== 'echo' || state.winner) return;
    if (!isValidPlacement(x, y, state.pieces)) return;

    // Validate movement distance
    const maxDist = piece.type === 'nexus' ? 2 : 3;
    const dist = Math.max(Math.abs(piece.x - x), Math.abs(piece.y - y));
    if (dist > maxDist) return;

    const newPieces = state.pieces.map(p =>
      p.id === pieceId ? { ...p, x, y } : p
    );

    const move: Move = {
      player: state.currentPlayer,
      type: 'move',
      pieceId,
      x, y,
      fromX: piece.x,
      fromY: piece.y,
    };

    try {
      sounds.move();
    } catch {
      // Audio not critical
    }

    set({
      pieces: newPieces,
      selectedPieceId: null,
      moveHistory: [...state.moveHistory, move],
    });
  },

  createForgeStone: (x, y) => {
    const { pieces, currentPlayer, echoEnergy, phase, winner } = get();
    if (phase !== 'forge' || echoEnergy[currentPlayer] < 3 || !isValidPlacement(x, y, pieces) || winner) return;

    const pieceId = `forge-${Date.now()}-${x}-${y}`;
    const newPiece: Piece = {
      id: pieceId,
      player: currentPlayer,
      type: 'forge',
      x, y,
    };

    const newEnergy = { ...echoEnergy };
    newEnergy[currentPlayer] -= 3;

    const move: Move = {
      player: currentPlayer,
      type: 'forge',
      x, y,
      pieceId,
    };

    try {
      sounds.forge();
    } catch {
      // Audio not critical
    }

    set({
      pieces: [...pieces, newPiece],
      echoEnergy: newEnergy,
      moveHistory: [...get().moveHistory, move],
    });
  },

  advancePhase: () => {
    const state = get();
    if (state.winner) return;

    let nextPhase = state.phase;
    let nextPlayer = state.currentPlayer;

    if (state.phase === 'forge') {
      nextPhase = 'echo';
    } else if (state.phase === 'echo') {
      nextPhase = 'pulse';
    } else if (state.phase === 'pulse') {
      // Pulse phase — resolve captures + win conditions
      const captures = checkCaptures(state.pieces, state.currentPlayer);
      let newPieces = state.pieces.filter(p => !captures.some(c => c.id === p.id));

      const newEnergy = { ...state.echoEnergy };
      if (captures.length > 0) {
        newEnergy[state.currentPlayer] = Math.min(15, newEnergy[state.currentPlayer] + captures.length);
        try {
          sounds.capture();
        } catch {
          // Audio not critical
        }
      }

      const opponent = state.currentPlayer === 'black' ? 'white' : 'black';
      const nexus = newPieces.find(p => p.player === opponent && p.type === 'nexus');
      let winner = state.winner;

      if (nexus && isNexusCaptured(nexus, newPieces)) {
        winner = state.currentPlayer;
        try {
          sounds.nexusCapture();
        } catch {
          // Audio not critical
        }
      } else if (checkFiveInARow(newPieces, state.currentPlayer)) {
        winner = state.currentPlayer;
        try {
          sounds.lineWin();
        } catch {
          // Audio not critical
        }
      } else if (checkDraw(newPieces, state.moveHistory)) {
        winner = 'draw';
      } else {
        nextPlayer = opponent;
        nextPhase = 'forge';
      }

      // Validate phase transition
      if (!isValidPhaseTransition(state.phase, nextPhase)) {
        console.error(`[NEXUS FORGE] Invalid phase transition: ${state.phase} -> ${nextPhase}`);
        return;
      }

      const move: Move = {
        player: state.currentPlayer,
        type: 'phase',
        fromPhase: state.phase,
        toPhase: nextPhase,
      };

      set({
        pieces: newPieces,
        echoEnergy: newEnergy,
        currentPlayer: nextPlayer,
        phase: nextPhase,
        winner,
        moveHistory: [...state.moveHistory, move],
      });
      return;
    }

    // Validate phase transition
    if (!isValidPhaseTransition(state.phase, nextPhase)) {
      console.error(`[NEXUS FORGE] Invalid phase transition: ${state.phase} -> ${nextPhase}`);
      return;
    }

    const move: Move = {
      player: state.currentPlayer,
      type: 'phase',
      fromPhase: state.phase,
      toPhase: nextPhase,
    };

    set({ phase: nextPhase, currentPlayer: nextPlayer, moveHistory: [...state.moveHistory, move] });
  },

  resetGame: () => set(createInitialState()),

  undoMove: () => {
    const state = get();
    if (state.moveHistory.length === 0 || state.winner) return;

    const history = [...state.moveHistory];
    const lastMove = history.pop()!;

    // Find the last non-phase move to undo to
    let targetSnapshot: StateSnapshot | null = null;

    if (lastMove.type === 'place' || lastMove.type === 'forge') {
      // Remove the placed piece
      const newPieces = state.pieces.filter(p => p.id !== lastMove.pieceId);
      // Restore energy
      const newEnergy = { ...state.echoEnergy };
      if (lastMove.type === 'forge') {
        newEnergy[lastMove.player] += 3;
      } else {
        newEnergy[lastMove.player] = Math.max(0, newEnergy[lastMove.player] - 1);
      }
      targetSnapshot = {
        pieces: newPieces,
        currentPlayer: lastMove.player,
        phase: 'forge' as Phase,
        echoEnergy: newEnergy,
        moveHistory: history,
        winner: null,
        selectedPieceId: null,
      };
    } else if (lastMove.type === 'move') {
      // Restore piece to original position
      const newPieces = state.pieces.map(p =>
        p.id === lastMove.pieceId ? { ...p, x: lastMove.fromX, y: lastMove.fromY } : p
      );
      targetSnapshot = {
        pieces: newPieces,
        currentPlayer: lastMove.player,
        phase: 'echo' as Phase,
        echoEnergy: { ...state.echoEnergy },
        moveHistory: history,
        winner: null,
        selectedPieceId: null,
      };
    } else if (lastMove.type === 'phase') {
      // Just revert the phase
      targetSnapshot = {
        pieces: clonePieces(state.pieces),
        currentPlayer: lastMove.player,
        phase: lastMove.fromPhase,
        echoEnergy: { ...state.echoEnergy },
        moveHistory: history,
        winner: null,
        selectedPieceId: null,
      };
    }

    if (targetSnapshot) {
      // Push current state to redo stack before applying
      const redoStack = JSON.parse(localStorage.getItem('nexus-forge-redo') || '[]') as StateSnapshot[];
      const currentSnapshot = createSnapshot(state);
      redoStack.push(currentSnapshot);
      localStorage.setItem('nexus-forge-redo', JSON.stringify(redoStack));

      set(targetSnapshot);
    }
  },

  redoMove: () => {
    const redoStack = JSON.parse(localStorage.getItem('nexus-forge-redo') || '[]') as StateSnapshot[];
    if (redoStack.length === 0) return;

    const snapshot = redoStack.pop()!;
    localStorage.setItem('nexus-forge-redo', JSON.stringify(redoStack));

    set({
      pieces: clonePieces(snapshot.pieces),
      currentPlayer: snapshot.currentPlayer,
      phase: snapshot.phase,
      echoEnergy: { ...snapshot.echoEnergy },
      moveHistory: [...snapshot.moveHistory],
      winner: snapshot.winner,
      selectedPieceId: snapshot.selectedPieceId,
    });
  },

  selectPiece: (id) => set({ selectedPieceId: id }),
}));
