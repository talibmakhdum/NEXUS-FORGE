/**
 * API Contract for NEXUS FORGE Backend
 *
 * Defines the REST API and WebSocket message schemas
 * for the future backend service. This serves as the
 * contract between frontend and backend teams.
 *
 * Base URL: /api/v1
 */

import type { Player, Phase } from './types';

// ─── REST Endpoints ─────────────────────────────────────

export interface APIEndpoints {
  // Game Management
  'POST /api/v1/games': {
    request: { playerName: string; preferredColor?: Player };
    response: { gameId: string; playerToken: string; playerColor: Player };
  };

  'GET /api/v1/games/:gameId': {
    request: void;
    response: { gameId: string; status: 'waiting' | 'active' | 'finished'; players: string[] };
  };

  'POST /api/v1/games/:gameId/join': {
    request: { playerName: string };
    response: { playerToken: string; playerColor: Player };
  };

  // Game State
  'GET /api/v1/games/:gameId/state': {
    request: void;
    response: GameStateResponse;
  };

  'POST /api/v1/games/:gameId/moves': {
    request: { move: unknown; playerToken: string };
    response: { accepted: boolean; gameState: GameStateResponse; reason?: string };
  };

  // Forfeit
  'POST /api/v1/games/:gameId/forfeit': {
    request: { playerToken: string };
    response: { success: boolean };
  };
}

// ─── Response Types ─────────────────────────────────────

export interface GameStateResponse {
  gameId: string;
  boardSize: number;
  pieces: Array<{
    id: string;
    player: Player;
    type: 'standard' | 'forge' | 'nexus';
    x: number;
    y: number;
  }>;
  currentPlayer: Player;
  phase: Phase;
  echoEnergy: { black: number; white: number };
  moveHistory: unknown[];
  winner: Player | 'draw' | null;
  turnNumber: number;
  turnTimeLeft: number;
  status: 'active' | 'finished';
}

// ─── WebSocket Events ───────────────────────────────────

export interface WSEvents {
  // Client → Server
  'authenticate': { playerToken: string };
  'move': { move: unknown };
  'forfeit': {};
  'ping': { timestamp: number };

  // Server → Client
  'authenticated': { success: boolean };
  'game-state': GameStateResponse;
  'move-accepted': { move: unknown; gameState: GameStateResponse };
  'move-rejected': { reason: string };
  'player-joined': { playerName: string; playerColor: Player };
  'player-disconnected': { playerColor: Player; reason: string };
  'turn-timer': { player: Player; timeLeft: number };
  'game-over': { winner: Player | 'draw'; reason: string };
  'pong': { timestamp: number; serverTime: number };
}

// ─── Error Codes ────────────────────────────────────────

export const API_ERROR_CODES = {
  INVALID_MOVE: 'INVALID_MOVE',
  UNAUTHORIZED: 'UNAUTHORIZED',
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  GAME_FULL: 'GAME_FULL',
  WRONG_TURN: 'WRONG_TURN',
  GAME_OVER: 'GAME_OVER',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

// ─── Implementation Status ──────────────────────────────

export const IMPLEMENTATION_STATUS: Record<keyof APIEndpoints, 'implemented' | 'planned' | 'stub'> = {
  'POST /api/v1/games': 'planned',
  'GET /api/v1/games/:gameId': 'planned',
  'POST /api/v1/games/:gameId/join': 'planned',
  'GET /api/v1/games/:gameId/state': 'planned',
  'POST /api/v1/games/:gameId/moves': 'planned',
  'POST /api/v1/games/:gameId/forfeit': 'planned',
};
