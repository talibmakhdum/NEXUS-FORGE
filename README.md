# NEXUS FORGE ⚔️

> A cyberpunk hybrid of Chess × Go × Gomoku — Fast 5–8 minute matches built for today's gamers.

[![CI/CD](https://img.shields.io/github/actions/workflow/status/talibmakhdum/NEXUS-FORGE/test.yml?branch=main&style=flat-square&logo=github&label=CI/CD)](https://github.com/talibmakhdum/NEXUS-FORGE/actions)
[![Tests](https://img.shields.io/badge/tests-Vitest-brightgreen?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Coverage](https://img.shields.io/badge/coverage-80%25+-brightgreen?style=flat-square)](#testing)
[![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square&logo=nextdotjs)](#production-build)
[![ESLint](https://img.shields.io/badge/eslint-strict-4B32C3?style=flat-square&logo=eslint)](#code-quality)

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwindcss)
![Zustand](https://img.shields.io/badge/Zustand-5-ffbc11?style=flat-square)

## Features

- **13×13 Neon Board** with smooth Konva.js rendering + HTML fallback
- **3-Phase Turn System** (Forge → Echo → Pulse)
- **Three Piece Types**: Nexus, Standard Stones, Forge Stones
- **Two Win Conditions**: 5-in-a-row or capture enemy Nexus
- **Undo/Redo** with full move history
- **Draw Detection** (board full, turn limit)
- **Echo Energy System** with particle effects
- **Cyberpunk Sound Effects** + Haptic feedback
- **Keyboard Navigation** (arrow keys, Enter, Escape)
- **Full Accessibility** (ARIA labels, screen reader support, axe-core compliant)
- **Error Resilience** (ErrorBoundary, Konva fallback, structured logging)
- **Mobile-First** (viewport locked, responsive, touch support)
- **Multiplayer-Ready** (WebSocket skeleton, API contract, turn timer)

## Quick Start

```bash
git clone https://github.com/talibmakhdum/NEXUS-FORGE.git
cd NEXUS-FORGE
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run lint` | ESLint strict mode |
| `npm test` | Unit tests (Vitest) |
| `npm run test:coverage` | Tests with coverage |
| `npm run e2e` | E2E tests (Playwright) |

## Documentation

| File | Description |
|------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Game flow, state machine, component hierarchy |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Setup, testing, deployment guide |
| [RULES.md](RULES.md) | Game mechanics, controls, FAQ |

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript** (strict mode)
- **Konva.js** + react-konva (canvas rendering)
- **Zustand** (state management)
- **Framer Motion** (animations)
- **Tailwind CSS** (styling)
- **Vitest** + @testing-library (unit tests)
- **Playwright** (E2E tests)
- **Zod** (runtime validation)

## Project Structure

```
nexus-forge/
├── app/                      # Next.js app router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/               # React components
│   ├── Board.tsx             # Board with auto-fallback
│   ├── BoardKonva.tsx        # Canvas renderer
│   ├── BoardFallback.tsx     # HTML/CSS renderer (accessible)
│   ├── GameUI.tsx            # HUD + controls
│   ├── EchoEnergyBar.tsx
│   ├── WinModal.tsx
│   ├── SettingsModal.tsx     # Settings + rules
│   ├── ErrorBoundary.tsx
│   └── ScreenReaderAnnouncer.tsx
├── lib/                      # Game logic & utilities
│   ├── game-logic.ts         # Pure functions
│   ├── game-logic.test.ts    # Test suite
│   ├── types.ts              # TypeScript types
│   ├── validation.ts         # Zod schemas
│   ├── sounds.ts             # Audio engine
│   ├── socket.ts             # WebSocket skeleton
│   ├── api-contract.ts       # Backend API contract
│   └── error-logger.ts       # Structured logging
├── store/
│   └── gameStore.ts          # Zustand state
├── test/
│   └── setup.ts              # Test environment
├── e2e/
│   └── game.spec.ts          # Playwright tests
├── .github/workflows/
│   └── test.yml              # CI/CD pipeline
├── ARCHITECTURE.md
├── DEVELOPMENT.md
└── RULES.md
```

## Controls

| Input | Action |
|-------|--------|
| **Click/Tap** | Place stone (Forge) / Select & move piece (Echo) |
| **Arrow Keys** | Navigate board cells |
| **Enter / Space** | Confirm placement or move |
| **Escape** | Cancel selection |
| **END PHASE** | Advance to next phase |

## Testing

```bash
# Unit tests (Vitest)
npm test

# With coverage report
npm run test:coverage

# E2E tests (Playwright)
npm run e2e
```

**Coverage targets**: 80%+ on `lib/game-logic.ts`.

## Code Quality

- TypeScript strict mode
- ESLint with zero-warnings policy
- All game logic functions are pure (no side effects)
- Runtime validation with Zod schemas
- Structured error logging with severity levels

## CI/CD Pipeline

GitHub Actions runs on every push/PR:
1. TypeScript type check
2. ESLint (strict)
3. Vitest unit tests + coverage
4. Playwright E2E tests
5. Production build verification

## Roadmap

- [x] Core game mechanics
- [x] Win conditions (5-in-a-row, Nexus capture, draw)
- [x] Undo/redo system
- [x] Error handling & resilience
- [x] Accessibility (keyboard, ARIA, screen readers)
- [x] CI/CD pipeline
- [x] Test coverage (80%+)
- [ ] Multiplayer (WebSocket infrastructure ready)
- [ ] AI opponent
- [ ] Spectator mode
- [ ] Ranked matchmaking

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

- Keep game-logic.ts functions pure
- Add tests for new game mechanics
- Maintain TypeScript strict mode
- Run `npm run lint` before submitting

## License

MIT © Talib Makhdum

---

**Built with ❤️ for the next generation of gamers.**
