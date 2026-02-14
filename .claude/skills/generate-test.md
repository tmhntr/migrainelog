# /generate-test

Generate a test file for any module in the MigraineLog app.

## Usage

```
/generate-test <file-path>
```

## Arguments

- `file-path`: Path to the source file to test (e.g., `src/utils/risk.ts`, `src/components/RiskGauge.tsx`)

## Steps

1. **Read the source file** at the given path to understand its exports, types, and behavior.

2. **Read related files**: Check `src/models/` for relevant types, and any imports the source file uses.

3. **Determine test type** based on source location:

   **`src/utils/`** → Unit test
   - Test each exported function with multiple input scenarios.
   - Include edge cases: empty inputs, boundary values, null/undefined.
   - For `risk.ts`: test all factor calculations individually and combined.

   **`src/components/`** → Component test with React Native Testing Library
   - Import `render`, `fireEvent`, `screen` from `@testing-library/react-native`.
   - Test renders with required props.
   - Test user interactions (press, change).
   - Test conditional rendering.
   - Mock navigation if the component navigates.

   **`src/screens/`** → Screen test
   - Mock Zustand stores with test data.
   - Mock `@react-navigation/native` hooks.
   - Test initial render state.
   - Test key user flows (form submission, navigation).

   **`src/db/queries.ts`** → Integration test with in-memory SQLite
   - Set up in-memory database in `beforeEach`.
   - Run migrations to create schema.
   - Test all CRUD operations.
   - Test query filters and pagination.
   - Clean up in `afterEach`.

   **`src/stores/`** → Store test
   - Test initial state.
   - Test mutations update state correctly.
   - Mock database calls.
   - Test hydration from mock data.

4. **Create test file** at the appropriate `__tests__/` directory:
   - `src/utils/__tests__/<filename>.test.ts`
   - `src/components/__tests__/<ComponentName>.test.tsx`
   - `src/screens/__tests__/<ScreenName>.test.tsx`
   - `src/db/__tests__/<filename>.test.ts`
   - `src/stores/__tests__/<filename>.test.ts`

5. **Test structure**:
   - Use `describe` blocks grouping by function/feature.
   - Use clear test names: `it('returns high risk when trigger load exceeds threshold')`.
   - Follow AAA pattern: Arrange, Act, Assert.
   - No `any` types in tests — use proper typing.

6. **Verify**: Run `npm test -- --testPathPattern=<test-file>` to confirm tests pass.

## Conventions

- Test files use `.test.ts` or `.test.tsx` extension
- Tests live in `__tests__/` directories adjacent to source
- Use Jest matchers (`expect`, `toBe`, `toEqual`, `toHaveBeenCalled`)
- Mock external dependencies, not the module under test
- Prefer `@testing-library/react-native` over `enzyme` or shallow rendering
