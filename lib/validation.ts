import { z } from 'zod';

/**
 * Zod schemas for runtime game state validation.
 * Ensures game state never reaches an invalid configuration.
 */

export const PlayerSchema = z.enum(['black', 'white']);
export const PieceTypeSchema = z.enum(['standard', 'forge', 'nexus']);
export const PhaseSchema = z.enum(['forge', 'echo', 'pulse']);

export const PieceSchema = z.object({
  id: z.string().min(1),
  player: PlayerSchema,
  type: PieceTypeSchema,
  x: z.number().int().min(0).max(12),
  y: z.number().int().min(0).max(12),
});

export const MovePlaceSchema = z.object({
  player: PlayerSchema,
  type: z.literal('place'),
  x: z.number().int().min(0).max(12),
  y: z.number().int().min(0).max(12),
  pieceId: z.string(),
});

export const MoveForgeSchema = z.object({
  player: PlayerSchema,
  type: z.literal('forge'),
  x: z.number().int().min(0).max(12),
  y: z.number().int().min(0).max(12),
  pieceId: z.string(),
});

export const MoveMoveSchema = z.object({
  player: PlayerSchema,
  type: z.literal('move'),
  pieceId: z.string(),
  x: z.number().int().min(0).max(12),
  y: z.number().int().min(0).max(12),
  fromX: z.number().int().min(0).max(12),
  fromY: z.number().int().min(0).max(12),
});

export const MovePhaseSchema = z.object({
  player: PlayerSchema,
  type: z.literal('phase'),
  fromPhase: PhaseSchema,
  toPhase: PhaseSchema,
});

export const MoveSchema = z.discriminatedUnion('type', [
  MovePlaceSchema,
  MoveForgeSchema,
  MoveMoveSchema,
  MovePhaseSchema,
]);

export const GameStateSchema = z.object({
  boardSize: z.literal(13),
  pieces: z.array(PieceSchema).refine(
    (pieces) => {
      // Ensure no two pieces occupy the same cell
      const positions = new Set(pieces.map(p => `${p.x},${p.y}`));
      return positions.size === pieces.length;
    },
    { message: 'Two pieces cannot occupy the same cell' }
  ),
  currentPlayer: PlayerSchema,
  phase: PhaseSchema,
  echoEnergy: z.object({
    black: z.number().int().min(0).max(15),
    white: z.number().int().min(0).max(15),
  }),
  moveHistory: z.array(MoveSchema),
  winner: z.union([PlayerSchema, z.literal('draw'), z.null()]),
  selectedPieceId: z.string().nullable(),
  turnTimeLeft: z.number().int().min(0).max(90),
});

/** Valid phase transitions: from -> allowed to[] */
export const VALID_PHASE_TRANSITIONS: Record<string, readonly string[]> = {
  forge: ['echo'],
  echo: ['pulse'],
  pulse: ['forge'],
} as const;

/**
 * Validate a game state object.
 * Returns { success: true } or { success: false, error }.
 */
export function validateGameState(state: unknown) {
  return GameStateSchema.safeParse(state);
}

/**
 * Validate a phase transition.
 * forge → echo, echo → pulse, pulse → forge only.
 */
export function validatePhaseTransition(from: string, to: string): boolean {
  return VALID_PHASE_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Assert that a phase transition is valid.
 * Throws if invalid.
 */
export function assertValidPhaseTransition(from: string, to: string): void {
  if (!validatePhaseTransition(from, to)) {
    throw new Error(
      `Invalid phase transition: "${from}" -> "${to}". ` +
        `Valid transitions: ${JSON.stringify(VALID_PHASE_TRANSITIONS)}`
    );
  }
}
