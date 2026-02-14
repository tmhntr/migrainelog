# MigraineLog — System Design Document

## Overview

MigraineLog is a local-first React Native (Expo) mobile app for tracking migraine triggers, episodes, and treatments. All data is stored on-device in SQLite. This document covers the full system architecture.

---

## 1. Database Layer

### 1.1 Schema DDL

```sql
-- Applied in migration 001
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS triggers (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,               -- ISO-8601
  notes TEXT,
  category TEXT NOT NULL CHECK (category IN ('sleep', 'stress', 'food', 'weather', 'hormonal', 'other')),
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,               -- ISO-8601
  notes TEXT,
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
  duration_minutes INTEGER,
  symptoms TEXT NOT NULL DEFAULT '[]',   -- JSON array of strings
  aura INTEGER NOT NULL DEFAULT 0       -- 0 = false, 1 = true
);

CREATE TABLE IF NOT EXISTS treatments (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,               -- ISO-8601
  notes TEXT,
  type TEXT NOT NULL CHECK (type IN ('medication', 'rest', 'hydration', 'caffeine', 'other')),
  name TEXT NOT NULL,
  effective INTEGER                      -- NULL = unknown, 0 = no, 1 = yes
);
```

### 1.2 Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_triggers_timestamp ON triggers(timestamp);
CREATE INDEX IF NOT EXISTS idx_triggers_category ON triggers(category);
CREATE INDEX IF NOT EXISTS idx_episodes_timestamp ON episodes(timestamp);
CREATE INDEX IF NOT EXISTS idx_treatments_timestamp ON treatments(timestamp);
CREATE INDEX IF NOT EXISTS idx_treatments_type ON treatments(type);
```

### 1.3 Primary Keys

All tables use TEXT UUIDs generated client-side via `uuid.v4()` (from the `uuid` package or `expo-crypto`). This avoids auto-increment issues and supports potential future sync.

### 1.4 Migration Strategy

Migrations live in `src/db/migrations.ts` as an ordered array of migration objects:

```typescript
export interface Migration {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
}

export const migrations: Migration[] = [
  { version: 1, up: async (db) => { /* initial schema DDL */ } },
  // future migrations appended here
];
```

On app startup, `migrateDbIfNeeded(db)` in `src/db/migrate.ts`:
1. Creates `schema_version` table if it doesn't exist
2. Reads the current max version (0 if none)
3. Runs each migration with `version > current` in order
4. Inserts a row into `schema_version` for each applied migration
5. All migrations run inside a transaction for atomicity

### 1.5 Query Helpers

All query helpers live in `src/db/queries.ts`. Each entity has typed async CRUD functions:

```typescript
// Per-entity (triggers shown as example)
insertTrigger(db, data: TriggerInsert): Promise<Trigger>
getTriggerById(db, id: string): Promise<Trigger | null>
listTriggers(db, opts?: ListOptions): Promise<Trigger[]>
updateTrigger(db, id: string, data: Partial<TriggerInsert>): Promise<Trigger>
deleteTrigger(db, id: string): Promise<void>

// Same pattern for episodes and treatments

// Cross-entity
listRecentEvents(db, limit?: number): Promise<BaseEvent[]>
// Uses UNION ALL across all three tables, ordered by timestamp DESC

// Risk-specific
listTriggersInWindow(db, since: string): Promise<Trigger[]>
countEpisodesInWindow(db, since: string): Promise<number>
getAverageEpisodeGap(db, limit?: number): Promise<number | null>
```

`ListOptions` supports pagination (`limit`, `offset`), date range filtering (`since`, `until`), and entity-specific filters (e.g., `category` for triggers).

---

## 2. State Management

### 2.1 Store Architecture

Four Zustand stores in `src/stores/`:

| Store | File | State |
|-------|------|-------|
| Trigger | `trigger-store.ts` | `triggers: Trigger[]`, `loading: boolean` |
| Episode | `episode-store.ts` | `episodes: Episode[]`, `loading: boolean` |
| Treatment | `treatment-store.ts` | `treatments: Treatment[]`, `loading: boolean` |
| Risk | `risk-store.ts` | `score: number`, `label: RiskLabel`, `factors: RiskFactors`, `lastCalculated: string` |

### 2.2 Hydration Pattern

On app launch (in a root `<AppProvider>` or `useEffect` in root layout):

1. Open SQLite database connection
2. Call `hydrate()` on each entity store, which loads recent data from SQLite
3. Calculate initial risk score
4. Mark stores as loaded

```typescript
// Inside each entity store
hydrate: async (db) => {
  set({ loading: true });
  const items = await listTriggers(db, { limit: 100 });
  set({ triggers: items, loading: false });
}
```

### 2.3 Write-Through Pattern

All mutations follow: **write to SQLite first, update Zustand on success**.

```typescript
addTrigger: async (db, data) => {
  const trigger = await insertTrigger(db, data);    // SQLite first
  set((s) => ({ triggers: [trigger, ...s.triggers] })); // then Zustand
  useRiskStore.getState().recalculate(db);           // cross-store
}
```

### 2.4 Cross-Store Coordination

Trigger and episode mutations call `useRiskStore.getState().recalculate(db)` after successful writes. The risk store fetches fresh data from SQLite and runs the pure `calculateRisk()` function.

---

## 3. Navigation

### 3.1 Structure

```
BottomTabs
├── DashboardStack
│   └── DashboardScreen
├── TriggersStack
│   ├── TriggerListScreen
│   ├── TriggerDetailScreen
│   └── TriggerFormScreen
├── EpisodesStack
│   ├── EpisodeListScreen
│   ├── EpisodeDetailScreen
│   └── EpisodeFormScreen
├── TreatmentsStack
│   ├── TreatmentListScreen
│   ├── TreatmentDetailScreen
│   └── TreatmentFormScreen
└── SettingsStack
    └── SettingsScreen
```

### 3.2 Type-Safe Navigation

Defined in `src/navigation/types.ts`:

```typescript
export type RootTabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  TriggersTab: NavigatorScreenParams<TriggersStackParamList>;
  EpisodesTab: NavigatorScreenParams<EpisodesStackParamList>;
  TreatmentsTab: NavigatorScreenParams<TreatmentsStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type TriggersStackParamList = {
  TriggerList: undefined;
  TriggerDetail: { id: string };
  TriggerForm: { id?: string };  // id present = edit mode
};

// Same pattern for Episodes and Treatments stacks

export type DashboardStackParamList = {
  Dashboard: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
};
```

### 3.3 Deep Linking

Configuration in `src/navigation/linking.ts`:

```typescript
export const linking: LinkingOptions<RootTabParamList> = {
  prefixes: ['migrainelog://'],
  config: {
    screens: {
      TriggersTab: {
        screens: {
          TriggerForm: 'quick-log/trigger',
        },
      },
      EpisodesTab: {
        screens: {
          EpisodeForm: 'quick-log/episode',
        },
      },
      TreatmentsTab: {
        screens: {
          TreatmentForm: 'quick-log/treatment',
        },
      },
    },
  },
};
```

Widget quick-log URLs: `migrainelog://quick-log/trigger`, `migrainelog://quick-log/episode`, `migrainelog://quick-log/treatment`.

---

## 4. Screen Breakdown

### 4.1 Screen Inventory (11 total)

| Screen | Route | Data Dependencies | Key Components |
|--------|-------|-------------------|----------------|
| Dashboard | `Dashboard` | Risk store, recent events (all 3 types) | RiskGauge, EventCard list, StatsSummary, QuickLogButton |
| TriggerList | `TriggerList` | Trigger store | EventCard list, FilterChips (category), EmptyState |
| TriggerDetail | `TriggerDetail` | Single trigger by ID | EventCard (expanded), edit/delete actions |
| TriggerForm | `TriggerForm` | Optional trigger for edit | CategoryPicker, SeveritySlider, DateTimePicker, notes input |
| EpisodeList | `EpisodeList` | Episode store | EventCard list, FilterChips (severity range), EmptyState |
| EpisodeDetail | `EpisodeDetail` | Single episode by ID | EventCard (expanded), SymptomPicker (read-only), edit/delete |
| EpisodeForm | `EpisodeForm` | Optional episode for edit | SeveritySlider (1-10), SymptomPicker, aura toggle, duration input, DateTimePicker |
| TreatmentList | `TreatmentList` | Treatment store | EventCard list, FilterChips (type), EmptyState |
| TreatmentDetail | `TreatmentDetail` | Single treatment by ID | EventCard (expanded), effectiveness toggle, edit/delete |
| TreatmentForm | `TreatmentForm` | Optional treatment for edit | CategoryPicker (treatment types), name input, DateTimePicker |
| Settings | `Settings` | App preferences | Export data, clear data, about info |

### 4.2 Screen Component Composition

**Dashboard** composes:
- `RiskGauge` — circular/semicircular gauge showing score 0–100 with color-coded label
- `QuickLogButton` — FAB or row of buttons to quickly log trigger/episode/treatment
- `StatsSummary` — cards showing episode count (7d/30d), top trigger category, treatment effectiveness %
- Recent events list — `EventCard` components for last ~10 events across all types

**Entity List screens** compose:
- `FilterChips` — horizontal scrollable chips for category/type/severity filtering
- `FlatList` of `EventCard` components
- `EmptyState` when no events exist
- FAB or header button to navigate to Form screen

---

## 5. Risk Calculation Algorithm

### 5.1 Overview

The risk engine produces a score from 0–100 mapped to four labels:

| Score Range | Label | Color |
|-------------|-------|-------|
| 0–25 | Low | Green |
| 26–50 | Moderate | Yellow |
| 51–75 | High | Orange |
| 76–100 | Critical | Red |

### 5.2 Input Parameters

```typescript
export interface RiskInput {
  recentTriggers: Trigger[];           // triggers in last 24h
  triggerHistory: Trigger[];           // triggers in last 7d (for accumulation)
  recentEpisodeCount: number;          // episodes in last 7d
  averageEpisodeGapDays: number | null; // avg days between episodes (last 10)
  lastEpisodeTimestamp: string | null;  // most recent episode
}
```

### 5.3 Scoring Factors

**Factor 1: Recent Trigger Load (0–40 points)**

Sum of `severity * categoryWeight` for triggers in last 24 hours, normalized to 0–40.

Category weights:
| Category | Weight |
|----------|--------|
| sleep | 1.5 |
| hormonal | 1.4 |
| stress | 1.3 |
| food | 1.1 |
| weather | 1.0 |
| other | 0.8 |

```
rawScore = sum(trigger.severity * categoryWeight[trigger.category])
factor1 = min(40, rawScore * (40 / 15))  // 15 = normalization ceiling
```

**Factor 2: Trigger Accumulation (0–20 points)**

Count of distinct trigger categories in last 7 days. More variety = higher risk.

```
uniqueCategories = new Set(triggerHistory.map(t => t.category)).size
factor2 = min(20, uniqueCategories * (20 / 6))  // 6 categories max
```

**Factor 3: Episode Frequency (0–25 points)**

Based on recent episode count relative to historical average gap.

```
if (averageEpisodeGapDays === null) factor3 = 0  // not enough data
else if (recentEpisodeCount >= 3) factor3 = 25
else factor3 = min(25, (recentEpisodeCount / 3) * 25)
```

**Factor 4: Recency (0–15 points)**

How recently the last episode occurred. More recent = higher risk.

```
if (lastEpisodeTimestamp === null) factor4 = 0
else {
  hoursSince = hoursBetween(lastEpisodeTimestamp, now)
  if (hoursSince < 24) factor4 = 15
  else if (hoursSince < 48) factor4 = 10
  else if (hoursSince < 72) factor4 = 5
  else factor4 = 0
}
```

### 5.4 Function Signature

```typescript
export interface RiskResult {
  score: number;           // 0–100
  label: 'low' | 'moderate' | 'high' | 'critical';
  factors: {
    triggerLoad: number;
    triggerAccumulation: number;
    episodeFrequency: number;
    recency: number;
  };
}

export function calculateRisk(input: RiskInput): RiskResult;
```

### 5.5 Recalculation Triggers

- App launch (during hydration)
- Any trigger insert/update/delete
- Any episode insert/update/delete
- 15-minute interval while app is foregrounded (via `useInterval` hook)

---

## 6. Widget Architecture

### 6.1 Shared Data

Both iOS and Android widgets read a JSON payload from shared storage:

```typescript
export interface WidgetData {
  riskScore: number;
  riskLabel: string;
  triggerCount24h: number;
  episodeCount7d: number;
  lastUpdated: string;          // ISO-8601
}
```

### 6.2 Platform Implementation

**iOS:**
- Uses App Groups (`group.com.migrainelog.shared`)
- Writes to `UserDefaults(suiteName: "group.com.migrainelog.shared")`
- Widget built with WidgetKit (SwiftUI timeline provider)
- Refresh triggered via `WidgetCenter.shared.reloadAllTimelines()`

**Android:**
- Uses `SharedPreferences` with a known file name
- Widget built with standard `AppWidgetProvider`
- Refresh triggered via broadcast intent

### 6.3 Widget Bridge

`src/widgets/widget-bridge.ts` exposes a native module:

```typescript
export interface WidgetBridge {
  updateWidgetData(data: WidgetData): Promise<void>;
  triggerWidgetRefresh(): Promise<void>;
}
```

Called from the risk store after every recalculation:

```typescript
// In risk-store.ts recalculate()
const result = calculateRisk(input);
set({ score: result.score, label: result.label, factors: result.factors });
await widgetBridge.updateWidgetData({
  riskScore: result.score,
  riskLabel: result.label,
  triggerCount24h: recentTriggers.length,
  episodeCount7d: recentEpisodeCount,
  lastUpdated: new Date().toISOString(),
});
await widgetBridge.triggerWidgetRefresh();
```

### 6.4 Quick-Log via Deep Links

Widget buttons launch the app via deep links:
- `migrainelog://quick-log/trigger` → opens TriggerForm (new)
- `migrainelog://quick-log/episode` → opens EpisodeForm (new)
- `migrainelog://quick-log/treatment` → opens TreatmentForm (new)

The navigation linking config (Section 3.3) handles routing.

---

## 7. Component Hierarchy

### 7.1 Shared Components (11 total)

| Component | File | Props | Description |
|-----------|------|-------|-------------|
| EventCard | `EventCard.tsx` | `event: BaseEvent, type: EventType, onPress` | Card displaying any event with type-specific styling |
| RiskGauge | `RiskGauge.tsx` | `score: number, label: RiskLabel` | Semicircular gauge with color gradient |
| QuickLogButton | `QuickLogButton.tsx` | `onPress: (type: EventType) => void` | Row of 3 icon buttons for quick-logging |
| SeveritySlider | `SeveritySlider.tsx` | `value, onChange, min, max, step` | Labeled slider for severity input |
| CategoryPicker | `CategoryPicker.tsx` | `categories: string[], value, onChange` | Horizontal chip selector for categories |
| SymptomPicker | `SymptomPicker.tsx` | `selected: string[], onChange, readOnly?` | Multi-select chip list for symptoms |
| DateTimePicker | `DateTimePicker.tsx` | `value: Date, onChange` | Date/time input wrapping platform picker |
| EmptyState | `EmptyState.tsx` | `title, message, actionLabel?, onAction?` | Illustrated placeholder for empty lists |
| StatsSummary | `StatsSummary.tsx` | `stats: DashboardStats` | Row of summary stat cards |
| ConfirmDialog | `ConfirmDialog.tsx` | `visible, title, message, onConfirm, onCancel` | Reusable confirmation modal |
| FilterChips | `FilterChips.tsx` | `options: string[], selected: string[], onChange` | Horizontal scrollable filter chips |

### 7.2 Dashboard Composition Tree

```
DashboardScreen
├── ScrollView
│   ├── RiskGauge (score, label)
│   ├── QuickLogButton (onPress → navigate to form)
│   ├── StatsSummary (stats)
│   └── FlatList
│       └── EventCard (for each recent event)
```

### 7.3 Entity List Composition Tree

```
TriggerListScreen (same pattern for Episode/Treatment)
├── FilterChips (category options, selected filters)
├── FlatList
│   └── EventCard (for each trigger)
│       └── onPress → navigate to TriggerDetail
├── EmptyState (when list is empty)
└── FAB → navigate to TriggerForm
```

---

## 8. File Manifest

```
src/
├── components/
│   ├── EventCard.tsx
│   ├── RiskGauge.tsx
│   ├── QuickLogButton.tsx
│   ├── SeveritySlider.tsx
│   ├── CategoryPicker.tsx
│   ├── SymptomPicker.tsx
│   ├── DateTimePicker.tsx
│   ├── EmptyState.tsx
│   ├── StatsSummary.tsx
│   ├── ConfirmDialog.tsx
│   └── FilterChips.tsx
├── screens/
│   ├── DashboardScreen.tsx
│   ├── TriggerListScreen.tsx
│   ├── TriggerDetailScreen.tsx
│   ├── TriggerFormScreen.tsx
│   ├── EpisodeListScreen.tsx
│   ├── EpisodeDetailScreen.tsx
│   ├── EpisodeFormScreen.tsx
│   ├── TreatmentListScreen.tsx
│   ├── TreatmentDetailScreen.tsx
│   ├── TreatmentFormScreen.tsx
│   └── SettingsScreen.tsx
├── db/
│   ├── database.ts               # DB connection singleton
│   ├── migrate.ts                # migrateDbIfNeeded()
│   ├── migrations.ts             # Migration[] array
│   └── queries.ts                # Typed CRUD + cross-entity queries
├── models/
│   ├── event.ts                  # BaseEvent, EventType, ListOptions
│   ├── trigger.ts                # Trigger, TriggerInsert, TriggerCategory
│   ├── episode.ts                # Episode, EpisodeInsert
│   └── treatment.ts              # Treatment, TreatmentInsert, TreatmentType
├── stores/
│   ├── trigger-store.ts
│   ├── episode-store.ts
│   ├── treatment-store.ts
│   └── risk-store.ts
├── widgets/
│   ├── widget-bridge.ts          # Native module interface
│   └── widget-data.ts            # WidgetData type
├── utils/
│   ├── risk.ts                   # calculateRisk() pure function
│   ├── date-helpers.ts           # ISO formatting, hoursBetween, etc.
│   └── statistics.ts             # Dashboard stat computations
├── navigation/
│   ├── types.ts                  # RootTabParamList, stack param lists
│   ├── linking.ts                # Deep link config
│   ├── TabNavigator.tsx          # Bottom tab navigator
│   └── stacks/
│       ├── DashboardStack.tsx
│       ├── TriggersStack.tsx
│       ├── EpisodesStack.tsx
│       ├── TreatmentsStack.tsx
│       └── SettingsStack.tsx
├── hooks/
│   ├── use-database.ts           # DB connection context hook
│   └── use-interval.ts           # setInterval hook for risk refresh
└── App.tsx                       # Root: DB init, hydration, navigation
```

**Total: ~45 source files**

---

## 9. Data Flow Summary

```
User Action
  → Screen calls store mutation
    → Store writes to SQLite (queries.ts)
      → On success, store updates Zustand state
        → If trigger/episode mutation, risk store recalculates
          → Risk store updates widget data via widget-bridge
            → Widget refreshes on home screen
  → React re-renders subscribed components
```

---

## 10. Testing Strategy

### Unit Tests
- `src/utils/risk.ts` — exhaustive test cases for all factor combinations, edge cases (no data, max data)
- `src/utils/date-helpers.ts` — ISO formatting, time calculations
- `src/utils/statistics.ts` — stat computation logic

### Integration Tests
- `src/db/queries.ts` — all CRUD operations against in-memory SQLite
- `src/db/migrate.ts` — migration execution and idempotency
- Store hydration and write-through (mock SQLite or use in-memory)

### Component Tests
- Shared components with React Native Testing Library
- Screen-level tests for critical user flows (Dashboard render, form submission)
