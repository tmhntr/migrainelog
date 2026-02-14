# /generate-screen

Scaffold a new screen for the MigraineLog app.

## Usage

```
/generate-screen <ScreenName> [--type list|detail|form|custom] [--entity trigger|episode|treatment]
```

## Arguments

- `ScreenName`: PascalCase name (e.g., `TriggerListScreen`)
- `--type`: Screen template type (default: `custom`)
- `--entity`: Entity this screen operates on (required for list/detail/form types)

## Steps

1. **Read context**: Read `docs/SYSTEM_DESIGN.md` for the screen breakdown and component composition, and `CLAUDE.md` for conventions.

2. **Create screen file** at `src/screens/<ScreenName>.tsx`:
   - Use functional component with hooks. No class components.
   - Use named export: `export function ScreenName() { ... }`
   - PascalCase filename matching component name.
   - Import navigation types from `src/navigation/types.ts`.
   - Use `useNavigation()` and `useRoute()` with proper type parameters.
   - Import data from Zustand stores (never import `expo-sqlite` directly).

3. **Apply template based on type**:

   **list**: FlatList rendering `EventCard` components, `FilterChips` at top, `EmptyState` when empty, FAB to navigate to form screen. Include pull-to-refresh calling store's `hydrate()`.

   **detail**: Load single item by route param `id`. Show expanded `EventCard`. Include edit button (navigates to form with `id`) and delete button (with `ConfirmDialog`).

   **form**: Controlled form inputs using entity-appropriate components (`SeveritySlider`, `CategoryPicker`, `SymptomPicker`, `DateTimePicker`). If route param `id` exists, load existing data for edit mode. Submit calls store mutation, then navigates back.

   **custom**: Minimal screen scaffold with `SafeAreaView` and placeholder content.

4. **Add navigation route**: Update the relevant stack navigator in `src/navigation/stacks/` to include the new screen. Add the route params to the stack's param list in `src/navigation/types.ts`.

5. **Generate test file** at `src/screens/__tests__/<ScreenName>.test.tsx`:
   - Render test verifying the screen mounts without crashing.
   - For list screens: test empty state and populated state.
   - For form screens: test submit button calls store mutation.
   - Mock navigation and stores.

6. **Verify**: Run `npm run typecheck` to confirm no type errors.

## Conventions

- Named exports only (no `export default`)
- Screens never import `expo-sqlite` — use stores and hooks
- Navigation types must be kept in sync with `src/navigation/types.ts`
- All DB access goes through stores, which use `src/db/queries.ts`
