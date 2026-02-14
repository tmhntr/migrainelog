# /generate-stats

Add a statistical/analytics function to the MigraineLog app with optional dashboard integration.

## Usage

```
/generate-stats <stat-name> [--dashboard] [--description <what-it-computes>]
```

## Arguments

- `stat-name`: camelCase name for the stat function (e.g., `triggerCategoryBreakdown`)
- `--dashboard`: Also integrate the stat into the Dashboard screen (default: false)
- `--description`: What the statistic computes and why it's useful

## Steps

1. **Read context**: Read `src/utils/statistics.ts` (if it exists) for existing patterns, and `docs/SYSTEM_DESIGN.md` for dashboard component composition.

2. **Design the stat function**:
   - Define input type: what data does it need? (events array, date range, etc.)
   - Define output type: what does it return? (number, percentage, ranked list, time series, etc.)
   - Keep it a pure function — no database or store access.

3. **Create/update `src/utils/statistics.ts`**:
   ```typescript
   export interface StatNameResult {
     // typed output
   }

   export function computeStatName(
     input: StatInput
   ): StatNameResult {
     // pure computation
   }
   ```

4. **Common stat patterns**:
   - **Frequency**: Count events in time windows (daily, weekly, monthly)
   - **Breakdown**: Group by category/type with counts and percentages
   - **Trend**: Compare current period to previous period (e.g., "up 20% from last week")
   - **Effectiveness**: Treatment effectiveness rate (effective / total where effective !== null)
   - **Correlation**: Which triggers most frequently precede episodes (within time window)
   - **Averages**: Mean severity, mean duration, mean gap between episodes

5. **Add query helper** if the stat needs a specialized query (follow `/generate-query` patterns):
   - Only add a new query if existing queries can't provide the needed data.
   - Prefer computing stats from data already available in stores.

6. **Dashboard integration** (if `--dashboard`):
   - Add the stat result to the `DashboardStats` interface.
   - Update `StatsSummary` component or add a new component to display the stat.
   - Compute the stat in `DashboardScreen` using data from stores.
   - Consider appropriate visualization (number, chart, list).

7. **Generate test file** at `src/utils/__tests__/statistics.test.ts`:
   - Test with representative data.
   - Test with empty data (should return sensible defaults, not crash).
   - Test edge cases: single item, all same values, boundary dates.
   - Test numerical accuracy for percentages and averages.

8. **Verify**: Run `npm run typecheck && npm test -- --testPathPattern=statistics`.

## Conventions

- Stat functions are pure — no side effects, no database access
- Use `kebab-case.ts` for utility files
- Named exports only
- Return typed result objects, not raw numbers
- Handle empty/insufficient data gracefully (return defaults, not errors)
- All date operations use helpers from `src/utils/date-helpers.ts`
