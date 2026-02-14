# /add-event-type

Add a new event type or extend an existing one across all layers of the MigraineLog app.

## Usage

```
/add-event-type <action> <entity> [--fields <field-definitions>]
```

## Arguments

- `action`: `new` (create a new event type) or `extend` (add fields to existing type)
- `entity`: Entity name in lowercase (e.g., `trigger`, `episode`, `treatment`, or a new name)
- `--fields`: Comma-separated field definitions (e.g., `location:text,intensity:integer:1-10`)

## Steps

### For `new` entity:

1. **Create model type** in `src/models/<entity>.ts`:
   - Define main entity type extending `BaseEvent` from `src/models/event.ts`.
   - Define insert type (omitting `id`).
   - Define any enum types for constrained fields.
   - Use named exports.

2. **Update event.ts**: Add the new entity to the `EventType` union in `src/models/event.ts`.

3. **Create migration** in `src/db/migrations.ts`:
   - Add a new migration with `CREATE TABLE` DDL.
   - Include `id TEXT PRIMARY KEY`, `timestamp TEXT NOT NULL`, `notes TEXT`.
   - Add entity-specific columns with appropriate `CHECK` constraints.
   - Create indexes on `timestamp` and filterable columns.

4. **Add query helpers** in `src/db/queries.ts`:
   - `insert<Entity>`, `get<Entity>ById`, `list<Entity>s`, `update<Entity>`, `delete<Entity>`
   - Update `listRecentEvents` UNION ALL to include the new table.

5. **Create Zustand store** at `src/stores/<entity>-store.ts`:
   - Follow existing store pattern: state, hydrate, add, update, delete actions.
   - Wire mutations to trigger risk recalculation if relevant.

6. **Create screens**: Use `/generate-screen` pattern to create List, Detail, and Form screens.

7. **Add navigation**:
   - Create stack navigator in `src/navigation/stacks/<Entity>sStack.tsx`.
   - Add tab to `src/navigation/TabNavigator.tsx`.
   - Add param list types to `src/navigation/types.ts`.
   - Add deep link config for quick-log.

8. **Update widget data** if the entity should appear in widget counts.

9. **Update risk calculation** in `src/utils/risk.ts` if the entity affects risk scoring.

10. **Generate tests** for model, queries, store, and screens.

### For `extend` (adding fields to existing entity):

1. **Create migration**: `ALTER TABLE` to add new columns.
2. **Update model types** in `src/models/<entity>.ts`.
3. **Update query helpers** in `src/db/queries.ts`.
4. **Update form screen** to include inputs for new fields.
5. **Update detail screen** to display new fields.
6. **Update tests** to cover new fields.
7. **Run verification**: `npm run typecheck && npm test`

## Conventions

- Types go in `src/models/` — one file per entity
- DB access only in `src/db/`
- Stores in `src/stores/` with write-through to SQLite
- Named exports throughout
- File naming: `kebab-case.ts` for non-component files
