# CLAUDE.md

## Project Overview

MigraineLog is a React Native (Expo) mobile app for tracking migraine triggers, episodes, and treatments. All data is stored locally on-device using SQLite. There is no backend server.

## Tech Stack

- React Native 0.81 + React 19 on Expo SDK 54 (managed workflow; eject to bare if widget support requires it)
- TypeScript (strict mode, extends `expo/tsconfig.base`)
- SQLite via `expo-sqlite` for local persistence
- `expo-crypto` (`randomUUID`) for generating event IDs
- Zustand 5 for state management
- React Navigation 7 (bottom tabs + native-stack navigators)

## Architecture Decisions

- **Local-first:** All data lives in SQLite on the device. No network calls, no auth, no cloud sync.
- **Widget support:** Home screen widgets for quick logging and risk display. This may require ejecting from Expo managed workflow or using expo-dev-client with native modules.
- **Risk calculation:** The "current risk level" is computed from recent triggers and historical episode frequency. The algorithm lives in `src/utils/risk.ts` and should be pure/testable.

## Code Conventions

- Use functional components with hooks. No class components.
- Prefer named exports over default exports.
- File naming:
  - `PascalCase.tsx` for React components, screens, and navigators (`src/components/`, `src/screens/`, `src/navigation/`).
  - `kebab-case.ts` for everything else — utilities, hooks, stores, models, and DB helpers.
- Keep database access in `src/db/` — screens and components should not import `expo-sqlite` directly. Consume the DB via `useDatabase()` from `src/hooks/use-database.ts`.
- Types go in `src/models/` — one file per entity (`trigger.ts`, `episode.ts`, `treatment.ts`) plus a shared `event.ts` for common fields and risk types.

## Data Model

Three event types share common fields (id, timestamp, notes):

- **Trigger** — category (enum: sleep, stress, food, weather, hormonal, other), severity (1-5)
- **Episode** — severity (1-10), duration_minutes, symptoms (JSON array), aura (boolean)
- **Treatment** — type (enum: medication, rest, hydration, caffeine, other), name (free text), effective (boolean, nullable — set after the fact)

## Key Commands

```bash
npm install --legacy-peer-deps  # Install dependencies (--legacy-peer-deps required due to react-test-renderer peer conflict)
npm start            # Start the Expo dev server (alias: expo start)
npm run ios          # Start dev server targeting iOS simulator (expo start --ios)
npm run android      # Start dev server targeting Android emulator (expo start --android)
npm run web          # Start dev server for web
npx expo run:ios     # Full native iOS build (use when prebuild/native changes are needed)
npx expo run:android # Full native Android build
npm test             # Run tests (Jest, jest-expo preset)
npm run lint         # Run ESLint over src/
npm run typecheck    # Run tsc --noEmit
```

## Testing

- Use Jest with React Native Testing Library.
- Test risk calculation logic thoroughly — it is the core business logic.
- DB query helpers should have integration tests using an in-memory SQLite database.

## Important Patterns

- All DB operations are async. Use the query helpers in `src/db/queries.ts` which return typed results (row → model mappers live alongside them).
- Schema changes go through the numbered migration runner in `src/db/migrations.ts` (applied by `src/db/migrate.ts`). Bump the version, add an `up`, and update queries/models in the same change.
- `DatabaseProvider` in `src/hooks/use-database.ts` opens the DB, runs migrations, hydrates every Zustand store, and recalculates risk before rendering the app. Components read the DB via `useDatabase()` and check readiness with `useDatabaseReady()`.
- Zustand stores in `src/stores/` (trigger, episode, treatment, risk) hydrate from SQLite on app launch and write-through on mutations. The risk store recomputes after mutations to other stores.
- The widget reads from a shared SQLite database or shared UserDefaults/SharedPreferences for the risk level value.
- Navigation structure: bottom tabs for Dashboard, Triggers, Episodes, Treatments, Settings. Each tab has its own native-stack navigator under `src/navigation/stacks/`.

## System Design

- Full architecture: [`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md) — database schema, state management, navigation, risk calculation, widget architecture, component hierarchy, and the complete file manifest.
- Surprisal-based risk scoring (planned extension to `src/utils/risk.ts`): [`docs/SURPRISAL_INTEGRATION.md`](docs/SURPRISAL_INTEGRATION.md), grounded in Turner et al., *JAMA Network Open* 2025 (PDF + text in `docs/`).

## Claude Skills

The following custom skills are available in `.claude/skills/`:

| Skill | Description |
|-------|-------------|
| `/generate-screen` | Scaffold list, detail, form, or custom screen with navigation integration |
| `/generate-component` | Create reusable UI component with props interface and tests |
| `/generate-migration` | Add numbered DB migration with schema changes + type/query updates |
| `/generate-test` | Generate test file for any module (component, store, util, query) |
| `/add-event-type` | Add new event type or extend existing one across all layers |
| `/generate-store` | Create Zustand store with optional SQLite persistence |
| `/dev-check` | Run typecheck, lint, test, and expo doctor in sequence |
| `/generate-query` | Add typed query helper to `src/db/queries.ts` with tests |
| `/scaffold-feature` | End-to-end feature scaffolding orchestrating other skills |
| `/generate-stats` | Add statistical/analytics function with dashboard integration |
