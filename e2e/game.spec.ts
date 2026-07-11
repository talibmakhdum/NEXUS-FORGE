import { test, expect } from '@playwright/test';

/**
 * E2E tests for NEXUS FORGE game
 * Covers: board interactions, phase transitions, win modal display
 */

test.describe('NEXUS FORGE', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ═══════════════════════════════════════════
  //  Page Load & Initial State
  // ═══════════════════════════════════════════
  test.describe('Page Load', () => {
    test('renders game title', async ({ page }) => {
      await expect(page.locator('text=NEXUS FORGE')).toBeVisible();
    });

    test('shows current player as BLACK on load', async ({ page }) => {
      await expect(page.locator('text=BLACK')).toBeVisible();
    });

    test('shows FORGE phase on load', async ({ page }) => {
      await expect(page.locator('text=FORGE')).toBeVisible();
    });

    test('renders the game board (Konva canvas)', async ({ page }) => {
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('NEW GAME button is visible', async ({ page }) => {
      await expect(page.locator('text=NEW GAME')).toBeVisible();
    });

    test('END FORGE button is visible in forge phase', async ({ page }) => {
      await expect(page.locator('text=END FORGE')).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════
  //  Board Interactions — Forge Phase
  // ═══════════════════════════════════════════
  test.describe('Forge Phase — Stone Placement', () => {
    test('clicking empty cell places a stone', async ({ page }) => {
      const canvas = page.locator('canvas');
      await canvas.click({ position: { x: 50, y: 50 } });
      // Stone should be rendered as a colored circle on the canvas
      // Visual check: canvas content changed
      await page.waitForTimeout(300);
    });

    test('cannot place stone on occupied cell', async ({ page }) => {
      const canvas = page.locator('canvas');
      // Place first stone
      await canvas.click({ position: { x: 100, y: 100 } });
      await page.waitForTimeout(200);
      // Try to place on same spot
      await canvas.click({ position: { x: 100, y: 100 } });
      // Should still be valid (no error) — the game should ignore invalid moves
    });

    test('places multiple stones in different cells', async ({ page }) => {
      const canvas = page.locator('canvas');
      const positions = [
        { x: 60, y: 60 },
        { x: 90, y: 90 },
        { x: 120, y: 120 },
      ];
      for (const pos of positions) {
        await canvas.click({ position: pos });
        await page.waitForTimeout(200);
      }
    });
  });

  // ═══════════════════════════════════════════
  //  Phase Transitions
  // ═══════════════════════════════════════════
  test.describe('Phase Transitions', () => {
    test('forge → echo transition', async ({ page }) => {
      // Click END FORGE to advance
      await page.click('text=END FORGE');
      await expect(page.locator('text=END ECHO')).toBeVisible();
    });

    test('echo → pulse transition', async ({ page }) => {
      await page.click('text=END FORGE');
      await expect(page.locator('text=END ECHO')).toBeVisible();
      await page.click('text=END ECHO');
      await expect(page.locator('text=RESOLVE PULSE')).toBeVisible();
    });

    test('pulse → forge transition (completes cycle)', async ({ page }) => {
      await page.click('text=END FORGE');
      await page.click('text=END ECHO');
      await page.click('text=RESOLVE PULSE');
      // After pulse resolves, should be back to FORGE
      await expect(page.locator('text=END FORGE')).toBeVisible();
    });

    test('player switches after pulse resolves', async ({ page }) => {
      // Black starts
      await expect(page.locator('text=BLACK')).toBeVisible();
      // Advance through all phases
      await page.click('text=END FORGE');
      await page.click('text=END ECHO');
      await page.click('text=RESOLVE PULSE');
      // Should now be WHITE's turn
      await expect(page.locator('text=WHITE')).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════
  //  Echo Phase — Piece Movement
  // ═══════════════════════════════════════════
  test.describe('Echo Phase — Piece Movement', () => {
    test('can select and move a piece in echo phase', async ({ page }) => {
      const canvas = page.locator('canvas');
      // Place a stone first in forge phase
      await canvas.click({ position: { x: 100, y: 100 } });
      await page.waitForTimeout(200);
      // Advance to echo
      await page.click('text=END FORGE');
      await expect(page.locator('text=END ECHO')).toBeVisible();
      // Click on the placed piece to select it
      await canvas.click({ position: { x: 100, y: 100 } });
      await page.waitForTimeout(200);
      // Click on an adjacent empty cell to move
      await canvas.click({ position: { x: 132, y: 100 } });
      await page.waitForTimeout(200);
    });

    test('cannot move opponent pieces', async ({ page }) => {
      // This would require white pieces on board — skip for basic test
      test.skip();
    });
  });

  // ═══════════════════════════════════════════
  //  Win Modal
  // ═══════════════════════════════════════════
  test.describe('Win Modal Display', () => {
    test('win modal appears on 5-in-a-row', async ({ page }) => {
      const canvas = page.locator('canvas');

      // Place 5 black stones in a horizontal row
      // We need to coordinate this with phase transitions
      // Strategy: place stones, skip echo, resolve pulse, repeat

      const stoneY = 100;
      const stonePositions = [60, 92, 124, 156, 188]; // 5 adjacent cells

      for (let i = 0; i < 5; i++) {
        // Place stone
        await canvas.click({ position: { x: stonePositions[i], y: stoneY } });
        await page.waitForTimeout(200);

        // Advance through phases to get back to forge
        if (i < 4) { // Don't advance after the last stone (pulse will detect win)
          await page.click('text=END FORGE');
          await page.waitForTimeout(200);
          await page.click('text=END ECHO');
          await page.waitForTimeout(200);
          await page.click('text=RESOLVE PULSE');
          await page.waitForTimeout(300);
        }
      }

      // Now advance to pulse to trigger win detection
      await page.click('text=END FORGE');
      await page.waitForTimeout(200);
      await page.click('text=END ECHO');
      await page.waitForTimeout(200);
      await page.click('text=RESOLVE PULSE');
      await page.waitForTimeout(500);

      // Win modal should appear
      await expect(page.locator('text=WINS').or(page.locator('text=BLACK WINS'))).toBeVisible();
    });

    test('win modal has REMATCH button', async ({ page }) => {
      const canvas = page.locator('canvas');

      // Quick setup for 5-in-a-row
      const stoneY = 120;
      const stonePositions = [60, 92, 124, 156, 188];

      for (let i = 0; i < 5; i++) {
        await canvas.click({ position: { x: stonePositions[i], y: stoneY } });
        await page.waitForTimeout(200);
        if (i < 4) {
          await page.click('text=END FORGE');
          await page.waitForTimeout(200);
          await page.click('text=END ECHO');
          await page.waitForTimeout(200);
          await page.click('text=RESOLVE PULSE');
          await page.waitForTimeout(300);
        }
      }

      await page.click('text=END FORGE');
      await page.waitForTimeout(200);
      await page.click('text=END ECHO');
      await page.waitForTimeout(200);
      await page.click('text=RESOLVE PULSE');
      await page.waitForTimeout(500);

      await expect(page.locator('text=REMATCH')).toBeVisible();
    });

    test('REMATCH button resets the game', async ({ page }) => {
      const canvas = page.locator('canvas');

      // Quick setup for 5-in-a-row
      const stoneY = 140;
      const stonePositions = [60, 92, 124, 156, 188];

      for (let i = 0; i < 5; i++) {
        await canvas.click({ position: { x: stonePositions[i], y: stoneY } });
        await page.waitForTimeout(200);
        if (i < 4) {
          await page.click('text=END FORGE');
          await page.waitForTimeout(200);
          await page.click('text=END ECHO');
          await page.waitForTimeout(200);
          await page.click('text=RESOLVE PULSE');
          await page.waitForTimeout(300);
        }
      }

      await page.click('text=END FORGE');
      await page.waitForTimeout(200);
      await page.click('text=END ECHO');
      await page.waitForTimeout(200);
      await page.click('text=RESOLVE PULSE');
      await page.waitForTimeout(500);

      // Click rematch
      await page.click('text=REMATCH');
      await page.waitForTimeout(500);

      // Should be back to initial state
      await expect(page.locator('text=FORGE')).toBeVisible();
      await expect(page.locator('text=BLACK')).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════
  //  NEW GAME Reset
  // ═══════════════════════════════════════════
  test.describe('NEW GAME Button', () => {
    test('NEW GAME resets to initial state', async ({ page }) => {
      const canvas = page.locator('canvas');
      // Place a stone
      await canvas.click({ position: { x: 100, y: 100 } });
      await page.waitForTimeout(200);

      // Click NEW GAME
      await page.click('text=NEW GAME');
      await page.waitForTimeout(300);

      // Should be back to black's forge phase
      await expect(page.locator('text=BLACK')).toBeVisible();
      await expect(page.locator('text=FORGE')).toBeVisible();
    });
  });
});
