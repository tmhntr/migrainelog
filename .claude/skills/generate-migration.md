# /generate-migration

Add a new numbered database migration to the MigraineLog app.

## Usage

```
/generate-migration <description>
```

## Arguments

- `description`: Brief description of the schema change (e.g., "add-location-to-triggers")

## Steps

1. **Read current migrations**: Read `src/db/migrations.ts` to determine the next version number.

2. **Read current schema**: Read the existing migration `up` functions to understand the current schema state.

3. **Add new migration** to the `migrations` array in `src/db/migrations.ts`:
   - Version number = last migration version + 1.
   - Write the `up` function with the appropriate DDL (`ALTER TABLE`, `CREATE TABLE`, `CREATE INDEX`, etc.).
   - Use `CHECK` constraints for enums.
   - Use `TEXT` for UUIDs and ISO-8601 timestamps.
   - Use `TEXT` with JSON for array columns.
   - Add appropriate indexes on filterable/sortable columns.

4. **Update TypeScript types**: Modify the relevant model file(s) in `src/models/` to reflect new/changed columns:
   - Update the main entity type (e.g., `Trigger`).
   - Update the insert type (e.g., `TriggerInsert`).
   - Add any new enum values to the appropriate type.

5. **Update query helpers**: Modify `src/db/queries.ts` to include new columns in:
   - INSERT statements
   - SELECT statements
   - UPDATE statements
   - Add new query functions if the migration enables new query patterns.

6. **Update system design doc**: Add the new migration to `docs/SYSTEM_DESIGN.md` schema section if it's a significant schema change.

7. **Generate migration test** in `src/db/__tests__/migrations.test.ts`:
   - Test that the migration applies successfully to a fresh database.
   - Test that the migration is idempotent (running `migrateDbIfNeeded` twice is safe).
   - Test that existing data is preserved after migration.

8. **Verify**: Run `npm run typecheck` and `npm test` to confirm everything passes.

## Conventions

- Migrations are append-only — never modify existing migration `up` functions
- Always use `IF NOT EXISTS` / `IF EXISTS` for safety
- Column additions use `ALTER TABLE ... ADD COLUMN` (SQLite doesn't support `DROP COLUMN` before 3.35)
- Keep migration `up` functions focused — one logical change per migration
- All DDL runs inside a transaction (handled by `migrateDbIfNeeded`)
