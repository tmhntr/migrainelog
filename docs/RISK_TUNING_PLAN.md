# Risk Model Tuning Plan

Companion to `src/utils/risk.ts` and `src/utils/__tests__/risk-calibration.test.ts`.

This document records what the current heuristic actually does across realistic
user-days, where it is miscalibrated, and a staged plan for fixing it without
breaking the gauge people already read.

---

## 1. What the model is today

`calculateRisk` sums four bounded factors into a 0–100 score:

| Factor | Range | Input | Formula |
|---|---|---|---|
| 1. Trigger load | 0–40 | triggers in the last **24h** | `min(40, Σ(severity × categoryWeight) × 40/15)` |
| 2. Trigger accumulation | 0–20 | triggers in the last **7d** | `min(20, uniqueCategories × 20/6)` |
| 3. Episode frequency | 0–25 | episodes in the last **7d** | `25` if ≥3, else `count/3 × 25`; `0` if no gap data |
| 4. Recency | 0–15 | last episode timestamp | `15 / 10 / 5 / 0` at `<24h / <48h / <72h / else` |

Category weights: `sleep 1.5, hormonal 1.4, stress 1.3, food 1.1, weather 1.0, other 0.8`.
Bands: `≤25 low, ≤50 moderate, ≤75 high, >75 critical`.

The windows are set by `risk-store.ts`, which passes the 24h window as
`recentTriggers` and the 7d window as `triggerHistory`.

---

## 2. Observed behaviour across scenarios

Scores computed against the current implementation:

| # | Scenario | Score | Band | Factors (F1/F2/F3/F4) |
|---|---|---|---|---|
| A | Brand-new user, nothing logged | 0.0 | low | 0 / 0 / 0 / 0 |
| B | Quiet day, one mild food trigger | 9.2 | low | 5.9 / 3.3 / 0 / 0 |
| C | Episodic, calm week, last attack 3 weeks ago | 12.5 | low | 5.9 / 6.7 / 0 / 0 |
| D | Episodic, **bad day** (sleep 5 + stress 4 + hormonal 3) | 53.3 | high | 40 / 13.3 / 0 / 0 |
| E | Same bad day, diligent logger (6 categories that week) | 60.0 | high | 40 / 20 / 0 / 0 |
| F | Chronic, 3 episodes/7d, attack 6h ago, **no triggers logged** | 40.0 | moderate | 0 / 0 / 25 / 15 |
| G | Same, plus 6 categories logged mildly that week | 60.0 | high | 0 / 20 / 25 / 15 |
| H | G plus one severe sleep trigger today | 80.0 | critical | 20 / 20 / 25 / 15 |
| I | Post-attack recovery, attack 20h ago, 1 episode/7d | 23.3 | low | 0 / 0 / 8.3 / 15 |
| J | Six severity-**1** triggers today | 38.9 | moderate | 18.9 / 20 / 0 / 0 |
| K | One severity-**5** sleep trigger today | 23.3 | low | 20 / 3.3 / 0 / 0 |
| L | Four severity-5 triggers, no episode history | 53.3 | high | 40 / 13.3 / 0 / 0 |

The rows that matter are the pairs. **D vs L**: a bad day and a catastrophic day
score identically. **J vs K**: six trivial annoyances outrank the single
strongest trigger this person has. **F vs D**: 40 points with nothing logged
today, against 53 for a genuinely dangerous day.

---

## 3. Diagnosed imbalances

Each is pinned by a characterization test in `risk-calibration.test.ts`.

**I1 — Factor 1 saturates far too early.**
The ceiling is a raw load of 15, which two or three severe triggers already
exceed (sleep 5 alone is 7.5). Above that the factor is flat, so the entire
upper half of the trigger space collapses onto 40 points. Severity stops
mattering exactly where it starts mattering clinically.

**I2 — Breadth outranks intensity.**
Factor 2 pays 3.33 points per unique category regardless of severity, so a user
who logs six severity-1 annoyances (38.9) outscores one who logs a severity-5
sleep trigger (23.3). This penalises thorough logging and rewards noise. It also
double-counts: because `recentTriggers ⊆ triggerHistory`, today's trigger feeds
both F1 and F2 (**I7**).

**I3 — Episodic users cannot reach critical.**
With no episodes in the last 7 days, F3 and F4 are both zero, capping the score
at 60. The worst day physically expressible tops out in the "high" band. The
population that most needs a pre-attack warning is structurally excluded from
the top band.

**I4 — Chronic users cannot reach low.**
F3 holds 25 for the entire 7-day window, and any engaged user parks F2 near 20.
The practical floor is ~45 — "moderate" — even on a completely calm day. The
low band is unreachable for the users who open the app most, which is textbook
alarm fatigue.

**I5 — The gauge reports history, not risk.**
Scenario G is "high" with nothing logged today: 60 points from past episodes and
week-old category variety. Factors 3 and 4 are retrospective; they describe what
happened, not what is coming. They currently supply up to 40% of a forward-looking
score.

**I6 — `averageEpisodeGapDays` is a null-gate only.**
The value is read solely to decide whether F3 is zero. A user attacking every
other day and one attacking twice a year score identically. A genuinely
informative input is being discarded.

**I8 — No confidence representation.**
`SURPRISAL_INTEGRATION.md` defines cold-start tiers (<7 entries insufficient,
7–13 preliminary, 14–27 usable, ≥28 full). The heuristic has no equivalent and
speaks with full confidence on day one, where two logged triggers already yield
a "moderate" reading from an empty evidence base.

---

## 4. Tuning plan

Four stages, ordered so that each is independently shippable and independently
verifiable. Nothing here changes the 0–100 range or the band edges, so
`RiskGauge`, the risk ramp in `palette.ts`, and the widget bridge are untouched.

### Stage 1 — Establish ground truth before changing any weight

Tuning without an outcome measure is redecorating. Before touching a
coefficient, build the evaluation harness:

1. **Fixture corpus.** A `src/utils/__tests__/fixtures/risk-corpus.ts` of
   synthetic user-histories (episodic, chronic, hormonal-dominant, sleep-driven,
   sparse logger, diligent logger), each a timeline of triggers and episodes.
2. **Backtest utility.** For each day in a fixture timeline, compute the score
   from data available *up to that day*, then check whether an episode began in
   the following 24h. No leakage of future rows.
3. **Metrics.** Report AUC (ranking quality, threshold-free), plus
   sensitivity/specificity at each band edge and the score distribution per
   band. The distribution is the balance check: if 70% of days land in one band,
   the gauge carries almost no information.
4. **Baseline.** Record the current model's numbers as the floor. Any tuning
   that does not beat them is rejected.

Deliverable: `npm run risk:backtest` printing a metrics table; the current
model's figures committed as the baseline.

### Stage 2 — Fix the shape of the two trigger factors

Cheap, high-confidence, no new data required.

- **Raise and soften the F1 ceiling (I1).** Replace the hard `min(40, raw × 40/15)`
  with a saturating curve: `40 × (1 − exp(−raw / k))`, `k ≈ 12`. Severity keeps
  paying all the way up, with diminishing returns instead of a cliff. Choose `k`
  by AUC on the corpus, not by eye.
- **Make F2 severity-aware (I2).** Score unique categories weighted by the mean
  severity within each: a category logged only at severity 1 should contribute a
  fraction of one logged at 5. Preserves the "multiple systems under load" signal
  without paying for noise.
- **Exclude the last 24h from F2's window (I2/I7).** Have `risk-store` pass
  `triggerHistory` as the 24h–7d band so the two factors read disjoint evidence.
  Requires a `until` bound on `listTriggersInWindow`; `ListOptions` already has
  the field.

Verification: I1, I2 and I7 characterization tests are rewritten as positive
assertions; all invariant tests must still pass unchanged.

### Stage 3 — Rebalance the episode factors against the trigger factors

The substantive change; ship behind a preference or a version flag so the
comparison is observable.

- **Split "baseline propensity" from "current risk" (I5).** Factors 3 and 4
  describe the person's baseline, not today. Compute a *personal baseline* from
  attack frequency (using the actual `averageEpisodeGapDays` value, **I6**) and
  express today's score as a deviation from that baseline. A chronic user's calm
  day should read low *for them*.
- **Recentre the bands per user (I3/I4).** With a personal baseline, normalise
  so that a typical day sits mid-"low" for every user. This is what makes
  critical reachable for episodic users and low reachable for chronic ones.
  Keep an absolute-severity floor so a genuinely dangerous day still reads high
  regardless of baseline.
- **Cap the retrospective contribution.** Post-attack refractory risk is real
  (episodes cluster), but it should not exceed ~25 points combined, versus the
  current 40. Tune the exact split on the corpus.

Verification: I3, I4, I5 and I6 tests are inverted to assert the new behaviour;
the corpus AUC must improve and the per-band distribution must flatten.

### Stage 4 — Confidence and the surprisal bridge

- **Expose confidence (I8).** Add `confidence: 'insufficient' | 'preliminary' | 'usable' | 'full'`
  to `RiskResult`, driven by logged-entry count using the tiers already defined
  in `SURPRISAL_INTEGRATION.md`. Below `usable`, the UI should present the score
  as provisional rather than suppressing it.
- **Blend with surprisal.** Once the diary tables land, blend the heuristic with
  the surprisal-derived probability, weighting toward surprisal as confidence
  rises. Use the same backtest harness to pick the blend curve — this is the
  reason Stage 1 comes first.

---

## 5. Rules for anyone tuning this

1. Never tune a coefficient without a corpus number showing it helped.
2. The invariant tests are not negotiable. Monotonicity, boundedness, the
   category ordering, and "empty log reads low" survive every retuning.
3. Changing a characterization test is fine — silently changing one is not.
   Each edit should reference the stage of this plan that motivated it.
4. Band edges belong to the design system. Retune the score, not the bands.
5. High risk must stay legible under duress: if a change increases how often the
   gauge reads high, it needs to earn that with specificity, not sensitivity
   alone.
