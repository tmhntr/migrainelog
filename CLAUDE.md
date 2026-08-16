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
- **Never hardcode a colour, font size, or spacing value.** Everything comes from the design system in `src/theme/` — see the Design System section below. A raw hex literal outside `src/theme/palette.ts` is a bug.
- Prefer the primitives in `src/components/ui/` (`Text`, `Surface`, `Button`, `Chip`, `Field`, `Input`, `Screen`, `Section`, `DetailRow`, `Divider`, `Fab`) over raw `View`/`Text`/`TouchableOpacity`. Reach for `StyleSheet.create` only for layout that the primitives don't cover.
- Keep database access in `src/db/` — screens and components should not import `expo-sqlite` directly. Consume the DB via `useDatabase()` from `src/hooks/use-database.ts`.
- Types go in `src/models/` — one file per entity (`trigger.ts`, `episode.ts`, `treatment.ts`) plus a shared `event.ts` for common fields and risk types.

## Data Model

Three event types share common fields (id, timestamp, notes):

- **Trigger** — category (enum: sleep, stress, food, weather, hormonal, other), severity (1-5)
- **Episode** — severity (1-10), duration_minutes, symptoms (JSON array), aura (boolean)
- **Treatment** — type (enum: medication, rest, hydration, caffeine, other), name (free text), effective (boolean, nullable — set after the fact)

## Key Commands

```bash
npx expo install              # Install dependencies (uses Expo's version resolver)
npx expo install <package>    # Add a new package with SDK-compatible version
npx expo install --check      # Check all deps are SDK-compatible (useful in CI)
npx expo install --fix        # Auto-fix any version mismatches
npx expo start                # Start dev server
npx expo run:ios              # Run on iOS
npx expo run:android          # Run on Android
npm test                      # Run tests (Jest)
npm run lint                  # Run ESLint
npm run typecheck             # Run tsc --noEmit
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

## Commit Messages

All commits **must** use [Conventional Commits](https://www.conventionalcommits.org/) format. This is enforced by commitlint via a husky `commit-msg` hook and drives automated semantic releases.

```
type(scope): description

[optional body]

[optional footer(s)]
```

**Types that trigger a release:**
- `feat:` — minor version bump (new feature)
- `fix:` — patch version bump (bug fix)
- `perf:` — patch version bump (performance improvement)
- Append `!` after type/scope (e.g. `feat!:`) or add a `BREAKING CHANGE:` footer for a major version bump

**Types that do NOT trigger a release:**
- `chore:`, `docs:`, `ci:`, `refactor:`, `test:`, `style:`, `build:`

**Examples:**
```
feat(triggers): add weather API integration for automatic trigger detection
fix(risk): correct cold-start threshold check for < 7 entries
docs: update SYSTEM_DESIGN.md with widget bridge sequence diagram
chore(deps): bump expo-sqlite to 16.1.0
feat!: redesign episode severity scale from 1-5 to 1-10
```

## Releases

Releases are fully automated via `semantic-release` and GitHub Actions:

- **`main`** → production release (e.g. `v1.2.0`) — Expo GitHub App triggers production EAS builds
- **`dev`** → beta pre-release (e.g. `v1.3.0-beta.1`) — Expo GitHub App triggers preview EAS builds
- Version bumps, changelogs, git tags, and GitHub Releases are all automated — never bump `version` in `package.json` manually.
- Config: `.releaserc.json`, `.github/workflows/release.yml`

## Git Branching Strategy

- **`main`** — Release branch. Always stable. Only updated by merging `dev` when cutting a release.
- **`dev`** — Integration/staging branch. All feature work lands here first.
- **Feature branches** — Branch off `dev`. Name as `feat/<desc>`, `fix/<desc>`, or `chore/<desc>`. Delete after merge.
- **Linear history** — Rebase before merging. On GitHub PRs, use "Rebase and merge" (not "Create a merge commit").
- **PR flow:** `feat/*` → PR into `dev` → when releasing, `dev` → PR into `main` (rebase and merge).
- **Never force push `main` or `dev`** unless rewriting history by agreement. Feature branches may be force-pushed freely.

## Design System

Lives in `src/theme/` (tokens) and `src/components/ui/` (primitives).

- `tokens.ts` — scheme-independent scales: `space` (4pt grid), `radius`, `border`, `duration`, and a nine-role type scale. Numeric variants (`display`, `metric`, `data`) carry `tabular-nums` so digits align and the risk score doesn't jitter on recalculation.
- `palette.ts` — `light` and `dark` colour roles, the four-step risk ramp, and per-event-type colours. Components consume role names (`ink`, `surface`, `accent`), never literals.
- `use-theme.ts` — `ThemeProvider`, `useTheme()`, `useThemedStyles(factory)`. The factory passed to `useThemedStyles` must be module-scope; it is deliberately excluded from the memo deps.
- `src/navigation/navigation-theme.ts` — bridges tokens into React Navigation's header/tab-bar/container chrome.

Three constraints are deliberate and should not be "fixed" without a reason:

1. **No pure white or pure black.** Light grounds on warm paper `#F2F0EC`; dark grounds on `#0F1013`. This app is used by photophobic people mid-attack.
2. **The risk ramp climbs warmer and darker, never brighter.** High risk is a desaturated rose, not a saturated red — the moment the gauge reads high is the moment its reader can least tolerate glare. `RiskGauge` also encodes level in the *shape* of the lit region, so it survives greyscale and colour blindness.
3. **Hairline borders and surface lift instead of drop shadows.** Shadows read as noise on the light ground and are invisible on the dark one.

Theme preference (`system` / `light` / `dark`) persists in the `preferences` table (migration v2) via `preference-store.ts`, hydrated in `DatabaseProvider`. Forcing dark independently of the OS is a real accessibility need here, not a cosmetic toggle.

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
