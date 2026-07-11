/**
 * WebSocket / Socket.io Skeleton for Future Multiplayer
 *
 * This module provides the client-side WebSocket infrastructure
 * for real-time multiplayer gameplay. It is currently a stub
 * that logs actions to console — actual Socket.io integration
 * will be wired in during the multiplayer phase.
 *
 * Usage:
 *   import { socket } from './socket';
 *   socket.connect();
 *   socket.emit('move', { player: 'black', type: 'place', x: 5, y: 5 });
 */

import { logError, logInfo } from './error-logger';
import type { Player, Move, Phase } from './types';

// ─── Types ──────────────────────────────────────────────

export interface SocketEvents {
  // Client → Server
  'move': (payload: { player: Player; move: Move }) => void;
  'join-game': (payload: { gameId: string; player: Player }) => void;
  'forfeit': (payload: { gameId: string; player: Player }) => void;

  // Server → Client
  'game-state': (state: unknown) => void;
  'player-joined': (payload: { player: Player; gameId: string }) => void;
  'player-disconnected': (payload: { player: Player }) => void;
  'move-accepted': (payload: { move: Move; gameState: unknown }) => void;
  'move-rejected': (payload: { reason: string; move: Move }) => void;
  'turn-timer': (payload: { player: Player; timeLeft: number }) => void;
  'game-over': (payload: { winner: Player | 'draw'; reason: string }) => void;
}

export interface SocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnect?: boolean;
  authToken?: string;
}

// ─── Constants ──────────────────────────────────────────

const DEFAULT_SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'ws://localhost:3001';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

// ─── Socket Manager ─────────────────────────────────────

class SocketManager {
  private ws: WebSocket | null = null;
  private url: string = DEFAULT_SOCKET_URL;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Map<string, Set<(payload: unknown) => void>> = new Map();
  private isConnected = false;

  // Callbacks
  public onConnect: (() => void) | null = null;
  public onDisconnect: (() => void) | null = null;
  public onError: ((error: Event) => void) | null = null;

  /**
   * Connect to the WebSocket server.
   * In the stub implementation, this logs the intent but does not open a real connection.
   */
  connect(options?: SocketOptions): void {
    if (options?.url) {
      this.url = options.url;
    }

    logInfo('Socket connect requested (stub — multiplayer not yet active)', 'socket:connect', {
      url: this.url,
      autoConnect: options?.autoConnect,
    });

    // Stub: simulate connection lifecycle without opening real WebSocket
    // When multiplayer is implemented, replace this with:
    // this.ws = new WebSocket(this.url);
    // this.ws.onopen = () => { ... };
    // this.ws.onmessage = () => { ... };
    // this.ws.onclose = () => { ... };
    // this.ws.onerror = () => { ... };

    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.onConnect?.();
  }

  /**
   * Disconnect from the WebSocket server.
   */
  disconnect(): void {
    logInfo('Socket disconnect requested (stub)', 'socket:disconnect');

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.ws?.close();
    this.ws = null;
    this.isConnected = false;
    this.onDisconnect?.();
  }

  /**
   * Emit an event to the server.
   * Stub implementation logs the event.
   */
  emit<K extends keyof SocketEvents>(
    event: K,
    ...args: Parameters<SocketEvents[K]>
  ): void {
    if (!this.isConnected) {
      logError({
        error: `Cannot emit "${event}" — socket not connected`,
        component: 'socket:emit',
        severity: 'warning',
      });
      return;
    }

    logInfo(`Socket emit (stub): ${event}`, 'socket:emit', {
      event,
      payload: args[0],
    });

    // When multiplayer is implemented:
    // this.ws?.send(JSON.stringify({ event, payload: args[0] }));
  }

  /**
   * Listen for server events.
   * Stub implementation stores the listener for future use.
   */
  on<K extends keyof SocketEvents>(
    event: K,
    callback: SocketEvents[K]
  ): () => void {
    const eventKey = event as string;
    if (!this.listeners.has(eventKey)) {
      this.listeners.set(eventKey, new Set());
    }
    this.listeners.get(eventKey)!.add(callback as (payload: unknown) => void);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventKey)?.delete(callback as (payload: unknown) => void);
    };
  }

  /**
   * Check if socket is currently connected.
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Get current reconnect attempt count.
   */
  get reconnectCount(): number {
    return this.reconnectAttempts;
  }
}

// ─── Singleton Export ───────────────────────────────────

export const socket = new SocketManager();

// ─── React Hook ─────────────────────────────────────────

import { useEffect, useState } from 'react';

/**
 * React hook for socket connection state.
 *
 * Usage:
 *   const { connected, emit } = useSocket();
 */
export function useSocket() {
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      setConnected(socket.connected);
    }, 1000);

    return () => clearInterval(checkInterval);
  }, []);

  return {
    connected,
    connect: socket.connect.bind(socket),
    disconnect: socket.disconnect.bind(socket),
    emit: socket.emit.bind(socket),
    on: socket.on.bind(socket),
  };
}

// ─── Server-Side Validator (client stub) ────────────────

/**
 * Validate a move on the server-side game state.
 * This function is a stub — the real implementation runs on the backend.
 */
export function validateServerMove(
  move: Move,
  gameState: unknown
): { valid: true } | { valid: false; reason: string } {
  logInfo('Server move validation (stub)', 'socket:validateServerMove', {
    move,
    gameState,
  });

  // When multiplayer is implemented, this calls the server API:
  // return fetch('/api/validate-move', { body: JSON.stringify({ move, gameState }) });

  return { valid: true };
}
