# /scaffold-feature

End-to-end feature scaffolding that orchestrates multiple generation steps for the MigraineLog app.

## Usage

```
/scaffold-feature <feature-name> [--description <what-the-feature-does>]
```

## Arguments

- `feature-name`: Short kebab-case name (e.g., `trigger-location`, `episode-weather`)
- `--description`: Description of the feature's purpose and behavior

## Steps

1. **Analyze the feature**: Determine which layers are affected:
   - New/modified database columns? → Migration needed
   - New model types or fields? → Model update needed
   - New query patterns? → Query helper needed
   - New/modified store? → Store update needed
   - New screens or screen modifications? → Screen work needed
   - New shared components? → Component creation needed
   - Risk calculation changes? → Risk algorithm update needed
   - Navigation changes? → Route/type updates needed

2. **Plan the implementation**: Create a numbered list of steps before executing. Present the plan to the user for confirmation.

3. **Execute in dependency order**:

   **Layer 1 — Data Model**:
   - Create/update model types in `src/models/` (follow `/add-event-type` patterns)
   - Create database migration in `src/db/migrations.ts` (follow `/generate-migration` patterns)

   **Layer 2 — Data Access**:
   - Add/update query helpers in `src/db/queries.ts` (follow `/generate-query` patterns)

   **Layer 3 — State Management**:
   - Create/update Zustand store (follow `/generate-store` patterns)

   **Layer 4 — UI Components**:
   - Create any new shared components (follow `/generate-component` patterns)

   **Layer 5 — Screens**:
   - Create/update screens (follow `/generate-screen` patterns)

   **Layer 6 — Navigation**:
   - Update navigation types, stack navigators, deep link config

   **Layer 7 — Widget** (if applicable):
   - Update widget data interface and bridge

4. **Generate tests** for each new/modified module (follow `/generate-test` patterns).

5. **Run verification** (follow `/dev-check` patterns):
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`

6. **Summary**: List all files created and modified.

## Conventions

- Follow all conventions from `CLAUDE.md`
- Each layer builds on the previous — execute in order
- Ask the user before proceeding if the feature scope is ambiguous
- Prefer extending existing files over creating new ones where appropriate
- Keep changes minimal and focused — don't over-engineer
