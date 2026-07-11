# NEXUS FORGE — Architecture

## Overview

NEXUS FORGE is a hybrid strategy board game combining elements of Go (liberties, captures), Chess (piece movement), and Gomoku (5-in-a-row win condition). It is built as a Next.js 15 React application with real-time canvas rendering via Konva.js.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  React UI   │  │  Game Store │  │  Board Renderer     │ │
│  │  (GameUI)   │◄─┤  (Zustand)  │◄─┤  (Konva / HTML)     │ │
│  └─────────────┘  └──────┬──────┘  └─────────────────────┘ │
│                          │                                   │
│                   ┌──────▼──────┐                          │
│                   │  Game Logic │                          │
│                   │  (Pure TS)  │                          │
│                   └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                              │
                    (Future: WebSocket)
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Server (Future)                         │
│                   ┌──────────────────┐                      │
│                   │  Game State      │                      │
│                   │  Validator       │                      │
│                   └──────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Game Flow

```
[FORGE] ──place stone──► [ECHO] ──move pieces──► [PULSE]
   ▲                                              │
   │                                              │
   └────────────── next player's turn ────────────┘
```

### Three-Phase Turn System

1. **FORGE**: Current player places one standard stone on any empty intersection. Gain +1 Echo Energy.
2. **ECHO**: Current player may move their pieces (up to 3 cells for standard, 2 for nexus). Costs no energy.
3. **PULSE**: Resolve captures (groups with 0 liberties are removed), check win conditions. If no win, pass turn to opponent.

## State Machine

```
                    ┌─────────┐
         ┌─────────►│  FORGE  │◄────────┐
         │          └────┬────┘         │
         │               │ end forge    │
         │               ▼              │
   pulse resolves   ┌─────────┐         │
   (no winner)      │  ECHO   │         │
         │          └────┬────┘         │
         │               │ end echo     │
         │               ▼              │
         │          ┌─────────┐         │
         └──────────┤  PULSE  ├─────────┘
   (winner found)   └────┬────┘
                        ▼
                   ┌─────────┐
                   │ GAME OVER│
                   └─────────┘
```

## Win Conditions

| Condition | Detection | Priority |
|-----------|-----------|----------|
| **Nexus Captured** | `isNexusCaptured()` — nexus has 0 liberties | 1st |
| **5-in-a-Row** | `checkFiveInARow()` — 5 consecutive stones | 2nd |
| **Draw** | `checkDraw()` — board full or turn limit | 3rd |

### Capture Mechanics (Go-style)

- Opponent stone groups with **zero liberties** (no empty adjacent cells) are captured
- Liberties are counted orthogonally (4 directions)
- Captured stones are removed and grant +1 Echo Energy each
- Nexus pieces are checked separately (`isNexusCaptured`) and are immune to group capture

## State Management

All game state lives in a single Zustand store (`store/gameStore.ts`).

```typescript
interface GameState {
  boardSize: number;        // Always 13
  pieces: Piece[];          // All stones on board
  currentPlayer: Player;    // 'black' | 'white'
  phase: Phase;             // 'forge' | 'echo' | 'pulse'
  echoEnergy: { black: number; white: number };  // 0-15
  moveHistory: Move[];      // Full move log for undo/redo
  winner: Player | 'draw' | null;
  selectedPieceId: string | null;  // For echo phase movement
  turnTimeLeft: number;     // 90 seconds per turn
}
```

### Undo/Redo System

- **Undo**: Pops the last move from `moveHistory`, reverses its effect on the board state. Current state is pushed to a redo stack in `localStorage`.
- **Redo**: Pops from the redo stack and restores that state.
- Undo/redo are disabled once a winner is declared.

## Component Hierarchy

```
page.tsx (NexusForge)
├── ErrorBoundary
├── ScreenReaderAnnouncer (aria-live)
├── GameUI
│   ├── PlayerInfo
│   ├── EchoEnergyBar (x2)
│   ├── ActionButtons (undo, phase, redo, settings)
│   └── SettingsModal
├── Board
│   ├── BoardKonva (primary — canvas rendering)
│   └── BoardFallback (HTML grid if Konva fails)
├── WinModal
└── KeyboardShortcuts
```

## File Structure

```
app/
├── page.tsx              # Main game page
├── layout.tsx            # Root layout with metadata
├── globals.css           # Global styles + animations
lib/
├── game-logic.ts         # Pure game logic functions
├── game-logic.test.ts    # Vitest test suite
├── types.ts              # TypeScript type definitions
├── validation.ts         # Zod schemas for runtime validation
├── sounds.ts             # Web Audio API sound engine
├── socket.ts             # WebSocket skeleton (future multiplayer)
├── api-contract.ts       # Backend API contract
└── error-logger.ts       # Structured error logging
store/
└── gameStore.ts          # Zustand game state management
components/
├── Board.tsx             # Board with Konva fallback
├── BoardKonva.tsx        # Canvas-based board (Konva)
├── BoardFallback.tsx     # HTML/CSS board (accessible)
├── GameUI.tsx            # Game controls and HUD
├── EchoEnergyBar.tsx     # Energy visualization
├── WinModal.tsx          # Victory overlay
├── SettingsModal.tsx     # Settings + rules
├── ErrorBoundary.tsx     # React error boundary
└── ScreenReaderAnnouncer.tsx  # ARIA live region
test/
└── setup.ts              # Vitest test environment setup
e2e/
└── game.spec.ts          # Playwright E2E tests
```

## Key Decisions

1. **Pure Game Logic**: All functions in `lib/game-logic.ts` are pure (no side effects). This enables comprehensive unit testing and easy server-side validation.

2. **Konva + HTML Fallback**: Canvas rendering via Konva.js for visual fidelity, with a full HTML/CSS fallback for accessibility and error resilience.

3. **Zustand over Redux**: Simpler API, less boilerplate, sufficient for the game's state complexity.

4. **No Server (Yet)**: Single-player only for Phase 1-2. Multiplayer infrastructure (WebSocket, API contract) is in place but not wired up.
