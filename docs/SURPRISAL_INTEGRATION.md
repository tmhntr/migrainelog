# Surprisal-Based Risk Scoring — Integration Guide

Based on Turner DP et al., "Information-Theoretic Trigger Surprisal and Future Headache Activity," *JAMA Network Open* 2025;8(11):e2542944.

---

## 1. Core Concept

The paper demonstrates that **surprisal** — a measure of how unusual a person's daily trigger exposures are relative to their own history — is a significant predictor of migraine onset within 12–24 hours.

**Surprisal** comes from information theory (Shannon, 1948): for an observed exposure value `x`, surprisal = `−log₂(p(x))`, measured in **bits**. A value the user logs every day has low surprisal (common → low information content). A value they rarely or never log has high surprisal (rare → high information content).

The key insight is that it's not *which* trigger occurs that matters most, but *how unexpected* that trigger is for the individual. A person who drinks coffee daily and skips it one morning has high surprisal on the "no caffeine" observation — and that deviation may predict a migraine, even though "no caffeine" isn't a traditional trigger.

**Key finding:** Each 1-bit increase in mean surprisal was associated with an OR of 1.86 (12h) and 2.15 (24h) for headache onset, with the 24-hour horizon showing a stronger and more linear association.

---

## 2. Trigger Diary Items From the Study

The paper used twice-daily diaries (AM and PM) capturing the following trigger domains. These map to expanded versions of our existing `TriggerCategory` enum.

### 2.1 AM Diary Items

| Domain | Specific Items | Measurement |
|--------|---------------|-------------|
| **Sleep** | Sleep duration, sleep quality, number of awakenings, bedtime, wake time | Continuous / ordinal |
| **Food (late-night)** | Late-night meal (yes/no) | Binary |
| **Weather** | Weather influence perceived | Ordinal |
| **Mood** (Profile of Mood States Short Form) | Tension-anxiety, depression-dejection, anger-hostility, vigor-activity, fatigue-inertia, confusion-bewilderment | 5-point Likert each |

### 2.2 PM Diary Items

| Domain | Specific Items | Measurement |
|--------|---------------|-------------|
| **Food & Drink** | Commonly reported food/drink triggers (caffeine, alcohol, chocolate, aged cheese, etc.) | Binary / ordinal |
| **Environmental** | Environmental exposures (bright lights, strong smells, noise) | Binary / ordinal |
| **Meals** | Meal patterns, missed meals | Binary |
| **Weather** | Weather influence perceived | Ordinal |
| **Mood** (POMS Short Form) | Same 6 mood states as AM | 5-point Likert each |
| **Stress** (Daily Stress Inventory) | 58 common daily hassles | 7-point Likert each |

### 2.3 Mapping to MigraineLog Categories

The current schema uses a coarse `category` enum: `sleep | stress | food | weather | hormonal | other`. To support surprisal calculation, we need **granular, repeatable diary items** within each category:

| Current Category | Proposed Diary Items | Type |
|-----------------|---------------------|------|
| `sleep` | `sleep_duration_hours` (0–16), `sleep_quality` (1–5), `awakenings` (0–10) | Numeric |
| `stress` | `stress_level` (1–10), `work_stress` (1–5), `social_stress` (1–5) | Ordinal |
| `food` | `caffeine` (0–5 servings), `alcohol` (0–5 servings), `missed_meal` (boolean), `chocolate` (boolean), `aged_cheese` (boolean) | Mixed |
| `weather` | `weather_sensitivity` (1–5), `barometric_change` (boolean) | Mixed |
| `hormonal` | `menstrual_phase` (enum: follicular, ovulatory, luteal, menstrual, na), `hormonal_medication_change` (boolean) | Categorical |
| `mood` | `anxiety` (1–5), `fatigue` (1–5), `irritability` (1–5) | Ordinal |

> **Note:** `mood` is proposed as a new category (or folded into `stress`). The paper found mood states were significant contributors to surprisal scores.

---

## 3. The Surprisal Algorithm

### 3.1 Per-Item Surprisal

For each diary item, calculate how surprising the logged value is for this specific user.

```
Input:  item value x, user's historical distribution P(x) for this item
Output: surprisal in bits = −log₂(P(x))
```

**Building the empirical distribution:** For each diary item, maintain a frequency count of every observed value across all of the user's historical entries. The probability of value `x` is:

```
P(x) = count(x) / total_observations
```

**Handling unseen values:** If a value has never been observed before (P(x) = 0), assign a small floor probability. The paper doesn't specify an exact floor; we recommend:

```
P(x) = max(observed_probability, 1 / (total_observations + 1))
```

This Laplace-like smoothing prevents infinite surprisal while still giving very high scores to truly novel values.

**Example:**
- User has logged caffeine servings 30 times: {0: 2 times, 1: 5 times, 2: 20 times, 3: 3 times}
- Today they log 0 servings → P(0) = 2/30 = 0.067 → surprisal = −log₂(0.067) = 3.9 bits
- If they log 2 servings → P(2) = 20/30 = 0.667 → surprisal = −log₂(0.667) = 0.58 bits

### 3.2 Total Surprisal Score (Per Diary Entry)

Sum the item-level surprisals and **divide by the number of items** to get a mean surprisal per item. This normalization is critical — it allows entries with different numbers of items to be compared and prevents entries with more items from having systematically higher scores.

```
total_surprisal = (1/N) * Σᵢ (−log₂(P(xᵢ)))
```

where N = number of diary items logged in that entry.

Typical ranges from the paper:
- Non-headache days: mean ≈ 0.53–0.62 bits (AM/PM)
- Headache days: mean ≈ 0.62–0.74 bits (AM/PM)
- Overall range: roughly 0–2.5 bits

### 3.3 Lagged Surprisal Interaction

The paper found that the **previous entry's surprisal** modulates the current entry's predictive power:

- **Low prior surprisal + high current surprisal** → strongest headache predictor (OR up to 5.95 at 24h)
- **High prior surprisal + high current surprisal** → attenuated or even reversed association

This suggests an **adaptation effect**: sustained high surprisal may lead the system to "habituate," while a sudden spike from a calm baseline is most dangerous.

**Implementation:** Store the previous diary entry's total surprisal score. When computing current risk:

```typescript
// Simplified interaction model from Table 3 (24-hour)
const interactionOR = currentSurprisal * lagSurprisal;
// Negative interaction: high lag attenuates current effect
const adjustedLogOdds = β₀ + β₁ * currentSurprisal + β₂ * lagSurprisal + β₃ * interactionOR;
```

At 24 hours, the paper reports:
- β₁ (Surprisal): OR = 5.95 → logit ≈ 1.78
- β₂ (Surprisal_t-1): OR = 3.54 → logit ≈ 1.26
- β₃ (Surprisal × Surprisal_t-1): OR = 0.20 → logit ≈ −1.61

### 3.4 Nonlinear Effects at 12 Hours

At the 12-hour horizon, the association is nonlinear (quadratic). The paper found a significant Surprisal² × Surprisal_t-1 interaction (OR = 0.02, P = .01), meaning:

- At low lag values, headache probability increases *steeply* and nonlinearly with surprisal
- At high lag values, the curve flattens or reverses

For the 12-hour model, include a squared surprisal term:

```typescript
const adjustedLogOdds12h = β₀ + β₁ * S + β₂ * S² + β₃ * S_lag + β₄ * (S * S_lag) + β₅ * (S² * S_lag);
```

---

## 4. Proposed Architecture Changes

### 4.1 New Database Table: `diary_entries`

The surprisal system requires **structured, repeatable diary items** rather than free-form trigger events. This is a new data model alongside (not replacing) the existing `triggers` table.

```sql
-- Migration 00X
CREATE TABLE IF NOT EXISTS diary_items (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,              -- e.g. 'sleep_duration', 'caffeine', 'anxiety'
  label TEXT NOT NULL,            -- human-readable: 'Sleep Duration (hours)'
  category TEXT NOT NULL,         -- sleep, stress, food, weather, hormonal, mood
  value_type TEXT NOT NULL CHECK (value_type IN ('numeric', 'ordinal', 'boolean', 'categorical')),
  min_value REAL,                 -- for numeric/ordinal
  max_value REAL,                 -- for numeric/ordinal
  options TEXT,                   -- JSON array for categorical: ["follicular","ovulatory",...]
  active INTEGER NOT NULL DEFAULT 1,  -- user can enable/disable items
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS diary_entries (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,        -- ISO-8601
  period TEXT NOT NULL CHECK (period IN ('am', 'pm')),
  item_key TEXT NOT NULL,         -- FK to diary_items.key
  value REAL NOT NULL,            -- numeric representation of logged value
  raw_value TEXT,                 -- original value for categoricals
  UNIQUE(timestamp, period, item_key)  -- one value per item per diary period
);

CREATE INDEX IF NOT EXISTS idx_diary_entries_timestamp ON diary_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_diary_entries_item_key ON diary_entries(item_key);

-- Per-user empirical distributions (incrementally maintained)
CREATE TABLE IF NOT EXISTS item_distributions (
  item_key TEXT NOT NULL,
  value REAL NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (item_key, value)
);
```

### 4.2 New Files

```
src/
├── models/
│   └── diary.ts                  # DiaryItem, DiaryEntry, ItemDistribution types
├── db/
│   └── diary-queries.ts          # CRUD for diary_entries, distribution updates
├── utils/
│   └── surprisal.ts              # Pure surprisal calculation functions
├── stores/
│   └── diary-store.ts            # Zustand store for diary state
└── screens/
    ├── DiaryFormScreen.tsx        # AM/PM diary entry form
    └── SurprisalDetailScreen.tsx  # Visualization of surprisal breakdown
```

### 4.3 Core Algorithm Module: `src/utils/surprisal.ts`

```typescript
export interface ItemSurprisal {
  itemKey: string;
  value: number;
  probability: number;
  surprisalBits: number;
}

export interface DiarySurprisal {
  timestamp: string;
  period: 'am' | 'pm';
  items: ItemSurprisal[];
  totalSurprisal: number;       // sum of item surprisals
  meanSurprisal: number;        // totalSurprisal / items.length
}

export interface SurprisalRiskInput {
  currentSurprisal: number;     // mean surprisal of latest entry
  lagSurprisal: number | null;  // mean surprisal of previous entry
  hasCurrentHeadache: boolean;
  diaryPeriod: 'am' | 'pm';
}

export interface SurprisalRiskResult {
  probability12h: number;       // 0–1, probability of headache in 12h
  probability24h: number;       // 0–1, probability of headache in 24h
  meanSurprisal: number;
  itemBreakdown: ItemSurprisal[];
}

/** Calculate surprisal for a single item value given its distribution */
export function calculateItemSurprisal(
  value: number,
  distribution: Map<number, number>,  // value → count
  totalObservations: number,
): number;

/** Calculate total and mean surprisal for a diary entry */
export function calculateDiarySurprisal(
  items: Array<{ key: string; value: number }>,
  distributions: Map<string, Map<number, number>>,
  observationCounts: Map<string, number>,
): DiarySurprisal;

/** Estimate headache probability from surprisal scores */
export function estimateHeadacheRisk(input: SurprisalRiskInput): SurprisalRiskResult;
```

### 4.4 Integration With Existing Risk Score

The surprisal-based risk complements (and can eventually replace) the existing heuristic-based `calculateRisk()`. Two integration strategies:

**Strategy A — Parallel scores (recommended for initial release):**
Display both the existing 0–100 heuristic score and a surprisal-based probability. This lets users build enough diary history (the paper used 28 days) before surprisal becomes reliable.

```typescript
// In risk-store.ts
export interface CombinedRisk {
  heuristicScore: number;       // existing 0–100
  heuristicLabel: RiskLabel;
  surprisalProbability12h: number | null;  // null if < 14 days of diary data
  surprisalProbability24h: number | null;
  surprisalReady: boolean;      // true when enough history exists
}
```

**Strategy B — Blended score (future):**
Once enough data accumulates, blend the heuristic and surprisal scores:

```typescript
const blendWeight = Math.min(1, daysOfDiaryData / 28);  // 0–1 ramp over 28 days
const blendedScore = (1 - blendWeight) * heuristicScore + blendWeight * (surprisalProbability24h * 100);
```

### 4.5 Cold Start and Minimum Data

The surprisal algorithm requires a personal baseline distribution. The paper used 28 days of twice-daily diaries. Practical thresholds:

| Diary Entries | Status |
|--------------|--------|
| < 7 | Insufficient — show only heuristic score |
| 7–13 | Preliminary — show surprisal with "building baseline" indicator |
| 14–27 | Usable — show surprisal score with moderate confidence |
| ≥ 28 | Full confidence — surprisal is primary risk metric |

Distribution updates should be **incremental**: when a new diary entry is saved, update `item_distributions` counts rather than recomputing from scratch.

---

## 5. Diary UX Flow

### 5.1 Twice-Daily Prompts

The study used AM and PM diary entries. The app should:

1. Send a local notification in the morning (configurable, default 8:00 AM) prompting the AM diary
2. Send a local notification in the evening (configurable, default 8:00 PM) prompting the PM diary
3. Deep link from notification → `DiaryFormScreen` with the correct period pre-selected

### 5.2 DiaryFormScreen Layout

```
DiaryFormScreen
├── Period indicator (AM/PM, auto-detected or selectable)
├── ScrollView of diary items grouped by category
│   ├── Sleep section (AM only)
│   │   ├── Sleep duration slider (0–16h)
│   │   ├── Sleep quality (1–5 stars)
│   │   └── Awakenings stepper (0–10)
│   ├── Mood section
│   │   ├── Anxiety (1–5)
│   │   ├── Fatigue (1–5)
│   │   └── Irritability (1–5)
│   ├── Food & Drink section (PM only)
│   │   ├── Caffeine servings stepper
│   │   ├── Alcohol servings stepper
│   │   ├── Missed meal toggle
│   │   └── [Specific food triggers as toggles]
│   ├── Weather section
│   │   └── Weather sensitivity (1–5)
│   ├── Stress section (PM only)
│   │   └── Overall stress (1–10)
│   └── Hormonal section (if applicable)
│       └── Menstrual phase picker
├── "Did you have a headache since your last entry?" (Yes/No)
└── Save button
```

### 5.3 Post-Save Feedback

After saving a diary entry, immediately calculate and display the surprisal breakdown:

- Show overall surprisal score with a "how unusual was your day" framing
- Highlight the top 3 most surprising items (highest individual surprisal)
- Show 12h/24h risk estimate if enough baseline data exists
- Use plain language: "Your sleep was unusually short for you — this is the most surprising factor today"

---

## 6. Key Study Parameters for Reference

| Parameter | Value | Source |
|-----------|-------|--------|
| Sample size | 109 participants | Methods |
| Diary duration | 28 days | Methods |
| Diary frequency | Twice daily (AM + PM) | Methods |
| Headache prevalence | 29.5% of days | Results |
| OR (12h, unadjusted) | 1.86 (95% CI: 1.12–3.08) | Table 2 |
| OR (24h, unadjusted) | 2.15 (95% CI: 1.44–3.20) | Table 2 |
| OR (12h, adjusted for mean) | 1.56 (95% CI: 1.01–2.40) | Results |
| OR (24h, adjusted for mean) | 1.88 (95% CI: 1.27–2.79) | Results |
| ICC (both models) | 0.11 | Table 2 |
| Mean surprisal, no headache (AM) | 0.53 bits | Table 1 |
| Mean surprisal, headache (AM) | 0.62 bits | Table 1 |
| Mean surprisal, no headache (PM) | 0.62 bits | Table 1 |
| Mean surprisal, headache (PM) | 0.74 bits | Table 1 |
| Interaction OR (24h, S × S_lag) | 0.20 (95% CI: 0.07–0.59) | Table 3 |
| Strong predictor OR (24h, low lag) | 5.95 (95% CI: 2.54–13.95) | Table 3 |

---

## 7. Implementation Sequence

1. **Add diary data model** — `diary_items`, `diary_entries`, `item_distributions` tables + types + queries
2. **Implement `surprisal.ts`** — pure calculation functions with comprehensive tests
3. **Build `DiaryFormScreen`** — AM/PM entry form with configurable diary items
4. **Wire up `diary-store.ts`** — Zustand store with write-through, distribution updates on save
5. **Integrate with risk store** — parallel display alongside heuristic score
6. **Build `SurprisalDetailScreen`** — per-item breakdown visualization
7. **Add notification prompts** — local notifications for AM/PM diary reminders
8. **Dashboard integration** — show surprisal risk on dashboard when sufficient data exists
9. **Transition plan** — gradually increase surprisal weight as user accumulates data

---

## 8. Citation

Turner DP, Patel T, Caplis E, Houle TT. Information-Theoretic Trigger Surprisal and Future Headache Activity. *JAMA Netw Open*. 2025;8(11):e2542944. doi:10.1001/jamanetworkopen.2025.42944
