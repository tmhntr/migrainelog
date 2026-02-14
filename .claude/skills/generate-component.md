# /generate-component

Create a reusable UI component for the MigraineLog app.

## Usage

```
/generate-component <ComponentName> [--with-tests]
```

## Arguments

- `ComponentName`: PascalCase name (e.g., `RiskGauge`)
- `--with-tests`: Also generate a test file (default: true)

## Steps

1. **Read context**: Read `docs/SYSTEM_DESIGN.md` section 7 (Component Hierarchy) and `CLAUDE.md` for conventions.

2. **Create component file** at `src/components/<ComponentName>.tsx`:
   - Use functional component with hooks. No class components.
   - Named export: `export function ComponentName({ ... }: ComponentNameProps) { ... }`
   - Define props interface above the component: `export interface ComponentNameProps { ... }`
   - PascalCase filename.
   - Use `StyleSheet.create()` for styles at the bottom of the file.
   - Keep the component focused — one responsibility.
   - No direct database imports. Accept data via props.

3. **Props design**:
   - Use explicit prop types (no `any`).
   - Callback props named `onXxx` (e.g., `onPress`, `onChange`).
   - Optional props where sensible with reasonable defaults.
   - Import model types from `src/models/` as needed.

4. **Generate test file** at `src/components/__tests__/<ComponentName>.test.tsx`:
   - Use React Native Testing Library (`@testing-library/react-native`).
   - Test render with required props.
   - Test callback props fire correctly (e.g., `fireEvent.press`).
   - Test conditional rendering if the component has variants.

5. **Verify**: Run `npm run typecheck` to confirm no type errors.

## Conventions

- Named exports only (no `export default`)
- Components must not import from `expo-sqlite` or `src/db/`
- All data arrives via props — components are presentation-focused
- Styles use `StyleSheet.create()`, not inline style objects
- File is PascalCase `.tsx`
