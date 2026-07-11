# NEXUS FORGE — Game Rules

## Objective

Win the game by achieving one of the following:

1. **Five in a Row** — Place 5 of your stones consecutively in any straight line (horizontal, vertical, or diagonal).
2. **Capture the Nexus** — Surround your opponent's Nexus so it has no empty adjacent spaces (liberties).

## The Board

- **13×13 grid** (169 intersections)
- Two Nexuses start on the board:
  - Black Nexus at position D7 (3, 6)
  - White Nexus at position J7 (9, 6)

## Pieces

| Piece | Movement | Special |
|-------|----------|---------|
| **Standard** | Cannot move (placed in Forge phase) | Counts toward 5-in-a-row |
| **Forge** | Cannot move | Counts toward 5-in-a-row; costs 3 Echo Energy to create |
| **Nexus** | Up to 2 cells (Echo phase) | Win condition if captured; counts toward 5-in-a-row |

## Three-Phase Turn

Each turn consists of three phases:

### 1. FORGE — Place a Stone

- Place one **standard stone** on any empty intersection.
- Alternatively, spend **3 Echo Energy** to create a **Forge stone** (immovable, stronger for 5-in-a-row).
- Gain **+1 Echo Energy** for each standard stone placed.
- Click **END FORGE** when done placing.

### 2. ECHO — Move Pieces

- Select one of your pieces and move it to a valid empty cell.
- **Standard pieces**: Move up to 3 cells (Chess Queen movement, max distance).
- **Nexus**: Move up to 2 cells.
- **Forge stones**: Cannot move.
- Click **END ECHO** when done moving.

### 3. PULSE — Resolve Captures

- Captures are resolved automatically.
- Any **opponent group** with **zero liberties** (no adjacent empty cells) is captured.
- Gain **+1 Echo Energy** per captured stone.
- Check win conditions (Nexus capture, 5-in-a-row).
- If no winner, turn passes to the opponent.

## Echo Energy

| Aspect | Value |
|--------|-------|
| Starting energy | 5 per player |
| Maximum capacity | 15 |
| Gain per stone placed | +1 |
| Gain per stone captured | +1 per stone |
| Cost to create Forge stone | 3 |

## Capture Mechanics (Go-Style)

A group of connected stones is **captured** when it has **zero liberties**.

- **Liberty** = an empty orthogonal (up/down/left/right) adjacent intersection.
- Groups are connected stones of the same color touching orthogonally.
- The entire group is removed when captured.
- Nexuses are evaluated separately and are not captured by group capture.

### Example

```
  A B C D E
5 . ○ ○ ○ .   ○ = white stones
6 . ○ ● ○ .   ● = black stone (captured — 0 liberties)
7 . ○ ○ ○ .
```

The black stone at D6 is captured because it has no empty adjacent cells.

## Draw Conditions

The game is a draw if:
- The board is completely filled with stones.
- Both players pass their turns consecutively.

## Keyboard Controls

| Key | Action |
|-----|--------|
| Arrow Keys | Navigate board cells |
| Enter / Space | Place stone or confirm move |
| Escape | Cancel selection |

## FAQ

**Q: Can I place a stone on top of another stone?**
A: No. Each intersection can hold at most one piece.

**Q: What happens if my Nexus is captured?**
A: You lose immediately. The opponent wins.

**Q: Can Forge stones be captured?**
A: Yes. Forge stones follow the same capture rules as standard stones.

**Q: How many pieces can I move in the Echo phase?**
A: You can make multiple moves, but each piece can only be moved once per Echo phase.

**Q: What is the turn time limit?**
A: Each turn has a 90-second time limit (enforced in multiplayer; not enforced in local play).
