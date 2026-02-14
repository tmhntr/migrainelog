# /generate-query

Add a typed query helper function to the MigraineLog database layer.

## Usage

```
/generate-query <function-name> [--entity <entity>] [--description <what-it-does>]
```

## Arguments

- `function-name`: camelCase name for the query function (e.g., `listTriggersbyCategory`)
- `--entity`: Which entity table(s) this queries
- `--description`: Brief description of what the query returns

## Steps

1. **Read current queries**: Read `src/db/queries.ts` to understand existing patterns, imports, and helper types.

2. **Read relevant models**: Read the entity type(s) from `src/models/` to ensure proper typing.

3. **Design the query function**:
   - Determine parameters: `db: SQLiteDatabase` is always first, followed by filter/option params.
   - Determine return type: single entity, array, count, or aggregate.
   - Write the SQL query string.
   - Use parameterized queries (`?` placeholders) to prevent SQL injection.

4. **Add the function** to `src/db/queries.ts`:
   ```typescript
   export async function functionName(
     db: SQLiteDatabase,
     param: ParamType
   ): Promise<ReturnType> {
     const result = await db.getAllAsync<RawRow>(
       `SELECT ... FROM table WHERE ...`,
       [param]
     );
     return result.map(mapRowToEntity);
   }
   ```

5. **Type the raw row**: If the query involves JOINs or computed columns not in the entity type, define a local `RawRow` interface.

6. **Handle JSON columns**: Parse JSON TEXT columns (like `symptoms` in episodes) using `JSON.parse()` in the row mapper.

7. **Handle boolean columns**: SQLite stores booleans as 0/1 integers. Convert in the row mapper: `aura: Boolean(row.aura)`.

8. **Generate test** in `src/db/__tests__/queries.test.ts`:
   - Add a `describe` block for the new function.
   - Set up test data using existing insert helpers.
   - Test the happy path with expected results.
   - Test edge cases: empty results, boundary conditions.
   - Test filter parameters work correctly.
   - Use in-memory SQLite database (`:memory:`).

9. **Update store if needed**: If a store needs to call this new query, add an action or update `hydrate` to use it.

10. **Verify**: Run `npm run typecheck && npm test -- --testPathPattern=queries`.

## Conventions

- All queries are `async` functions returning `Promise`
- First parameter is always `db: SQLiteDatabase`
- Use parameterized queries — never interpolate values into SQL strings
- Parse JSON and boolean columns in row mappers
- Named exports, camelCase function names
- Queries live exclusively in `src/db/queries.ts`
