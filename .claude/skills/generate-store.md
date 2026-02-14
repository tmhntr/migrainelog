# /generate-store

Create a Zustand store with optional SQLite persistence for the MigraineLog app.

## Usage

```
/generate-store <StoreName> [--entity <entity-name>] [--persisted]
```

## Arguments

- `StoreName`: Name for the store (e.g., `trigger`, `episode`, `risk`)
- `--entity`: Entity type this store manages (reads model from `src/models/`)
- `--persisted`: Include SQLite write-through (default: true for entity stores)

## Steps

1. **Read context**: Read `docs/SYSTEM_DESIGN.md` section 2 (State Management) and the entity model in `src/models/` if applicable.

2. **Create store file** at `src/stores/<store-name>-store.ts`:
   - Use `kebab-case` filename.
   - Named export: `export const use<Name>Store = create<StoreState>()(...)`
   - Define state interface and actions interface.

3. **Store structure**:

   ```typescript
   import { create } from 'zustand';

   interface <Name>State {
     items: <Entity>[];
     loading: boolean;
     // actions
     hydrate: (db: SQLiteDatabase) => Promise<void>;
     add: (db: SQLiteDatabase, data: <Entity>Insert) => Promise<void>;
     update: (db: SQLiteDatabase, id: string, data: Partial<<Entity>Insert>) => Promise<void>;
     remove: (db: SQLiteDatabase, id: string) => Promise<void>;
   }
   ```

4. **Implement write-through pattern** (if `--persisted`):
   - `hydrate`: Load from SQLite via query helpers, update state.
   - `add`: Call `insert<Entity>()` in `src/db/queries.ts` first, then update Zustand state on success.
   - `update`: Call `update<Entity>()` first, then update state.
   - `remove`: Call `delete<Entity>()` first, then remove from state.
   - All mutations are `async` and handle errors.

5. **Cross-store coordination**:
   - If the store manages triggers or episodes, call `useRiskStore.getState().recalculate(db)` after mutations.
   - Import risk store only via `getState()` to avoid circular dependencies.

6. **For non-persisted stores** (e.g., UI state):
   - Simple synchronous state updates.
   - No database imports.

7. **Generate test file** at `src/stores/__tests__/<store-name>-store.test.ts`:
   - Test initial state values.
   - Test `hydrate` populates state from mock data.
   - Test mutations update state correctly.
   - Test write-through by mocking query helpers.
   - Test cross-store recalculation calls.

8. **Verify**: Run `npm run typecheck` to confirm no type errors.

## Conventions

- Store files use `kebab-case.ts`
- Named exports: `export const use<Name>Store`
- SQLite writes happen before Zustand updates (write-through)
- Stores never hold the database reference in state — it's passed as a parameter
- Cross-store calls use `getState()` to avoid subscription loops
