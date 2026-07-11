# NEXUS FORGE — Development Guide

## Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher

## Setup

```bash
# Clone the repository
git clone https://github.com/talibmakhdum/NEXUS-FORGE.git
cd NEXUS-FORGE

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server runs at `http://localhost:3000`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build production bundle |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint (strict mode) |
| `npm run typecheck` | Run TypeScript type checking (no emit) |
| `npm test` | Run Vitest unit tests once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:coverage` | Run Vitest with coverage report |
| `npm run e2e` | Run Playwright E2E tests |
| `npm run e2e:ui` | Run Playwright tests with UI |

## Testing

### Unit Tests (Vitest)

Tests are co-located with source files (e.g., `lib/game-logic.ts` → `lib/game-logic.test.ts`).

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

Coverage target: **80%+** on `lib/game-logic.ts`.

### E2E Tests (Playwright)

```bash
# Install browsers (first time only)
npx playwright install --with-deps chromium firefox

# Run E2E tests
npm run e2e

# Run with UI for debugging
npm run e2e:ui
```

## Code Quality

### TypeScript Strict Mode

The project uses TypeScript strict mode. All types must be explicitly defined. No `any` types allowed.

### ESLint

ESLint runs in strict mode with zero warnings tolerance in CI:

```bash
npm run lint -- --max-warnings=0
```

### Game Logic Purity

All functions in `lib/game-logic.ts` must be **pure**:
- No side effects
- No mutations of input arguments
- Deterministic output for given input

## Project Structure

```
app/              # Next.js app router pages
components/       # React components
lib/              # Pure game logic, types, utilities
store/            # Zustand state management
test/             # Test setup and utilities
e2e/              # Playwright E2E tests
```

## Adding New Features

1. **Game Logic**: Add pure functions to `lib/game-logic.ts` with corresponding tests in `lib/game-logic.test.ts`.
2. **State Changes**: Update `lib/types.ts` for new types, then `store/gameStore.ts` for state management.
3. **UI Components**: Add React components to `components/`.
4. **Validation**: Update `lib/validation.ts` with Zod schemas for any new state shapes.

## CI/CD Pipeline

GitHub Actions runs on every push and pull request to `main` or `develop`:

1. TypeScript type check
2. ESLint (strict mode, zero warnings)
3. Vitest unit tests with coverage
4. Playwright E2E tests
5. Next.js production build verification

See `.github/workflows/test.yml` for configuration.

## Deployment

### Static Export

The project is configured for static export via Next.js:

```bash
npm run build
```

Output is in the `.next/` directory. For static hosting:

```bash
# Using Next.js static export
# Add to next.config.ts: output: 'export'
# Then: npm run build
# Output: out/
```

### Docker (Optional)

```bash
docker build -t nexus-forge .
docker run -p 3000:3000 nexus-forge
```

See `Dockerfile` and `docker-compose.yml` for configuration.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket server URL (future multiplayer) | `ws://localhost:3001` |

## Troubleshooting

### Konva.js Rendering Issues

If the canvas board doesn't render, the HTML fallback board will automatically take over. Check the console for error messages tagged with `[NEXUS FORGE]`.

### Audio Not Playing

Web Audio API requires user interaction. Click anywhere on the page to unlock audio. The game handles this automatically on first interaction.
