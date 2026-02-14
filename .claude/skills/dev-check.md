# /dev-check

Run the full development verification pipeline for the MigraineLog app.

## Usage

```
/dev-check [--fix]
```

## Arguments

- `--fix`: Attempt to auto-fix lint issues (runs `npm run lint -- --fix`)

## Steps

1. **TypeScript check**: Run `npm run typecheck` (which runs `tsc --noEmit`).
   - If errors are found, list them grouped by file.
   - Attempt to fix type errors if they are straightforward (missing imports, incorrect types).

2. **Lint check**: Run `npm run lint` (or `npm run lint -- --fix` if `--fix` flag).
   - If errors remain after auto-fix, list them grouped by file.
   - Suggest fixes for common lint issues.

3. **Test suite**: Run `npm test`.
   - If tests fail, show the failure summary.
   - Read failing test files and source files to diagnose issues.
   - Suggest fixes for failing tests.

4. **Expo Doctor**: Run `npx expo doctor` to check for dependency and configuration issues.
   - Report any warnings or errors.

5. **Summary**: Provide a pass/fail summary for each step:
   ```
   Typecheck: PASS/FAIL (N errors)
   Lint:      PASS/FAIL (N errors, M warnings)
   Tests:     PASS/FAIL (N passed, M failed)
   Expo:      PASS/FAIL
   ```

6. **If all pass**: Confirm the codebase is in good shape.
   **If any fail**: Offer to fix the issues, prioritizing type errors first, then lint, then test failures.

## Notes

- Run checks in sequence because later checks may depend on earlier ones being clean.
- If `npm run typecheck` or `npm run lint` commands are not configured yet, note which scripts are missing from `package.json` and offer to add them.
- If `npm test` finds no test files, note that tests need to be written rather than reporting a failure.
