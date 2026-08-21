/**
 * Calibration and balance tests for the heuristic risk model.
 *
 * `risk.test.ts` covers the arithmetic — each factor against its own formula.
 * This file asks a different question: does the score *behave* like a risk
 * signal? It has three layers.
 *
 *   1. Invariants — properties that must survive any retuning of the weights.
 *      If a tuning change breaks one of these, the change is wrong.
 *   2. Calibration scenarios — realistic user-days with an expected band.
 *      These encode the product intent: what a person should see on that day.
 *   3. Characterization of known imbalances — cases where the model's answer
 *      is defensible arithmetic but poor risk communication. These pin the
 *      current behaviour so that fixing it is a deliberate, visible edit
 *      rather than a silent drift. Each is cross-referenced to the tuning
 *      plan in docs/RISK_TUNING_PLAN.md.
 */
import { calculateRisk, scoreToLabel } from '../risk';
import { RiskInput, RiskLabel } from '../../models/event';
import { Trigger, TriggerCategory } from '../../models/trigger';

const NOW = new Date('2026-08-17T12:00:00.000Z');

/** A trigger `hoursAgo` in the past. Time only matters via the caller's windowing. */
function trigger(category: TriggerCategory, severity: number, hoursAgo = 1): Trigger {
  return {
    id: `${category}-${severity}-${hoursAgo}`,
    timestamp: new Date(NOW.getTime() - hoursAgo * 3600_000).toISOString(),
    notes: null,
    eventType: 'trigger',
    category,
    severity,
  };
}

function hoursAgo(hours: number): string {
  return new Date(NOW.getTime() - hours * 3600_000).toISOString();
}

const ALL_CATEGORIES: TriggerCategory[] = [
  'sleep',
  'hormonal',
  'stress',
  'food',
  'weather',
  'other',
];

/**
 * Mirrors how `risk-store.ts` assembles the input: `recentTriggers` is the 24h
 * window and `triggerHistory` the 7d window, so recent triggers are always a
 * subset of history. Building scenarios any other way tests a state the app
 * cannot actually produce.
 */
function scenario(params: {
  today?: Trigger[];
  earlierThisWeek?: Trigger[];
  recentEpisodeCount?: number;
  averageEpisodeGapDays?: number | null;
  lastEpisodeHoursAgo?: number | null;
}): RiskInput {
  const today = params.today ?? [];
  const earlier = params.earlierThisWeek ?? [];
  return {
    recentTriggers: today,
    triggerHistory: [...today, ...earlier],
    recentEpisodeCount: params.recentEpisodeCount ?? 0,
    averageEpisodeGapDays: params.averageEpisodeGapDays ?? null,
    lastEpisodeTimestamp:
      params.lastEpisodeHoursAgo == null ? null : hoursAgo(params.lastEpisodeHoursAgo),
  };
}

const score = (input: RiskInput) => calculateRisk(input).score;
const label = (input: RiskInput) => calculateRisk(input).label;

beforeAll(() => {
  jest.useFakeTimers({ doNotFake: ['performance'] });
  jest.setSystemTime(NOW);
});

afterAll(() => {
  jest.useRealTimers();
});

// ---------------------------------------------------------------------------
// 1. Invariants — must hold under any weighting
// ---------------------------------------------------------------------------

describe('invariants', () => {
  it('always produces a finite score inside [0, 100]', () => {
    const inputs: RiskInput[] = [
      scenario({}),
      scenario({ today: ALL_CATEGORIES.map((c) => trigger(c, 5)) }),
      scenario({
        today: ALL_CATEGORIES.map((c) => trigger(c, 5)),
        recentEpisodeCount: 50,
        averageEpisodeGapDays: 0.5,
        lastEpisodeHoursAgo: 0,
      }),
      scenario({ recentEpisodeCount: 3, averageEpisodeGapDays: 0 }),
    ];
    for (const input of inputs) {
      const result = calculateRisk(input);
      expect(Number.isFinite(result.score)).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    }
  });

  it('reports a label consistent with its own score', () => {
    for (let severity = 1; severity <= 5; severity += 1) {
      for (let episodes = 0; episodes <= 4; episodes += 1) {
        const input = scenario({
          today: ALL_CATEGORIES.slice(0, 3).map((c) => trigger(c, severity)),
          recentEpisodeCount: episodes,
          averageEpisodeGapDays: 5,
          lastEpisodeHoursAgo: 30,
        });
        const result = calculateRisk(input);
        expect(result.label).toBe(scoreToLabel(result.score));
      }
    }
  });

  it('never reports a score below the sum of its own factors', () => {
    // The score is a clamped sum; it may be lower than the raw total at the
    // ceiling, but a factor must never silently fail to contribute.
    const input = scenario({
      today: [trigger('sleep', 3), trigger('stress', 2)],
      earlierThisWeek: [trigger('food', 1), trigger('weather', 1)],
      recentEpisodeCount: 2,
      averageEpisodeGapDays: 6,
      lastEpisodeHoursAgo: 30,
    });
    const { score: total, factors } = calculateRisk(input);
    const sum =
      factors.triggerLoad +
      factors.triggerAccumulation +
      factors.episodeFrequency +
      factors.recency;
    expect(sum).toBeLessThanOrEqual(100);
    expect(total).toBeCloseTo(sum);
  });

  it('is deterministic for identical input', () => {
    const input = scenario({
      today: [trigger('sleep', 4), trigger('food', 2)],
      recentEpisodeCount: 1,
      averageEpisodeGapDays: 9,
      lastEpisodeHoursAgo: 40,
    });
    expect(score(input)).toBe(score(input));
  });

  it('does not depend on the order triggers were logged in', () => {
    const triggers = [trigger('sleep', 4), trigger('food', 2), trigger('stress', 3)];
    const forward = scenario({ today: triggers });
    const reversed = scenario({ today: [...triggers].reverse() });
    expect(score(reversed)).toBeCloseTo(score(forward));
  });

  it('increases monotonically with trigger severity', () => {
    let previous = -1;
    for (let severity = 1; severity <= 5; severity += 1) {
      const current = score(scenario({ today: [trigger('sleep', severity)] }));
      expect(current).toBeGreaterThan(previous);
      previous = current;
    }
  });

  it('never decreases when another trigger is added to the same day', () => {
    let previous = score(scenario({ today: [] }));
    const accumulated: Trigger[] = [];
    for (const category of ALL_CATEGORIES) {
      accumulated.push(trigger(category, 3));
      const current = score(scenario({ today: [...accumulated] }));
      expect(current).toBeGreaterThanOrEqual(previous);
      previous = current;
    }
  });

  it('never decreases as recent episode count rises', () => {
    let previous = -1;
    for (let episodes = 0; episodes <= 5; episodes += 1) {
      const current = score(
        scenario({ recentEpisodeCount: episodes, averageEpisodeGapDays: 4 })
      );
      expect(current).toBeGreaterThanOrEqual(previous);
      previous = current;
    }
  });

  it('never increases as the last episode recedes into the past', () => {
    let previous = Infinity;
    for (const hours of [1, 12, 23, 25, 47, 49, 71, 73, 200]) {
      const current = score(
        scenario({ averageEpisodeGapDays: 10, lastEpisodeHoursAgo: hours })
      );
      expect(current).toBeLessThanOrEqual(previous);
      previous = current;
    }
  });

  it('weights sleep and hormonal triggers above weather and other', () => {
    // The category ordering is a clinical claim, not an implementation detail.
    const byCategory = ALL_CATEGORIES.map((category) => ({
      category,
      value: score(scenario({ today: [trigger(category, 3)] })),
    }));
    const rank = (c: TriggerCategory) =>
      byCategory.find((entry) => entry.category === c)!.value;

    expect(rank('sleep')).toBeGreaterThan(rank('hormonal'));
    expect(rank('hormonal')).toBeGreaterThan(rank('stress'));
    expect(rank('stress')).toBeGreaterThan(rank('food'));
    expect(rank('food')).toBeGreaterThan(rank('weather'));
    expect(rank('weather')).toBeGreaterThan(rank('other'));
  });

  it('treats an empty log as low rather than unknown-and-alarming', () => {
    // A brand-new user must not be greeted by a high-risk gauge.
    expect(label(scenario({}))).toBe('low');
    expect(score(scenario({}))).toBe(0);
  });

  it('holds the band boundaries where the UI expects them', () => {
    // RiskGauge and the risk ramp in palette.ts are built against these edges.
    const boundaries: Array<[number, RiskLabel]> = [
      [0, 'low'],
      [25, 'low'],
      [25.01, 'moderate'],
      [50, 'moderate'],
      [50.01, 'high'],
      [75, 'high'],
      [75.01, 'critical'],
      [100, 'critical'],
    ];
    for (const [value, expected] of boundaries) {
      expect(scoreToLabel(value)).toBe(expected);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Calibration scenarios — realistic days with an intended band
// ---------------------------------------------------------------------------

describe('calibration scenarios', () => {
  it('brand-new user with nothing logged reads low', () => {
    expect(label(scenario({}))).toBe('low');
  });

  it('quiet day with a single mild trigger reads low', () => {
    const input = scenario({
      today: [trigger('food', 2)],
      earlierThisWeek: [trigger('weather', 1, 60)],
      averageEpisodeGapDays: 21,
      lastEpisodeHoursAgo: 21 * 24,
    });
    expect(score(input)).toBeLessThan(20);
    expect(label(input)).toBe('low');
  });

  it('a genuinely bad trigger day reads at least high', () => {
    // Missed sleep, heavy stress, hormonal phase — the archetypal prodrome day.
    const input = scenario({
      today: [trigger('sleep', 5), trigger('stress', 4), trigger('hormonal', 3)],
      earlierThisWeek: [trigger('food', 2, 60)],
      averageEpisodeGapDays: 21,
      lastEpisodeHoursAgo: 21 * 24,
    });
    expect(score(input)).toBeGreaterThan(50);
    expect(['high', 'critical']).toContain(label(input));
  });

  it('a chronic pattern with a severe trigger on top reads critical', () => {
    const input = scenario({
      today: [trigger('sleep', 5)],
      earlierThisWeek: ALL_CATEGORIES.filter((c) => c !== 'sleep').map((c) =>
        trigger(c, 1, 60)
      ),
      recentEpisodeCount: 3,
      averageEpisodeGapDays: 2,
      lastEpisodeHoursAgo: 6,
    });
    expect(label(input)).toBe('critical');
  });

  it('separates a calm day from a bad day by a full two bands', () => {
    const calm = scenario({
      today: [trigger('food', 1)],
      averageEpisodeGapDays: 21,
      lastEpisodeHoursAgo: 21 * 24,
    });
    const bad = scenario({
      today: [trigger('sleep', 5), trigger('stress', 4), trigger('hormonal', 4)],
      averageEpisodeGapDays: 21,
      lastEpisodeHoursAgo: 21 * 24,
    });
    expect(score(bad) - score(calm)).toBeGreaterThan(35);
  });

  it('ranks the same trigger day higher for someone mid-cluster', () => {
    const triggersToday = [trigger('sleep', 3), trigger('stress', 3)];
    const stable = scenario({ today: triggersToday, averageEpisodeGapDays: 30 });
    const clustering = scenario({
      today: triggersToday,
      recentEpisodeCount: 3,
      averageEpisodeGapDays: 2,
      lastEpisodeHoursAgo: 12,
    });
    expect(score(clustering)).toBeGreaterThan(score(stable));
  });

  it('decays after an attack when no new triggers arrive', () => {
    const at = (hours: number) =>
      score(
        scenario({ recentEpisodeCount: 1, averageEpisodeGapDays: 14, lastEpisodeHoursAgo: hours })
      );
    expect(at(6)).toBeGreaterThan(at(36));
    expect(at(36)).toBeGreaterThan(at(60));
    expect(at(60)).toBeGreaterThan(at(100));
  });

  it('does not alarm on a lone low-severity trigger', () => {
    for (const category of ALL_CATEGORIES) {
      const input = scenario({ today: [trigger(category, 1)] });
      expect(label(input)).toBe('low');
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Known imbalances — characterized, not endorsed
// ---------------------------------------------------------------------------

describe('known imbalances (characterization — see docs/RISK_TUNING_PLAN.md)', () => {
  it('IMBALANCE 1: trigger load saturates so early that a severe day and a catastrophic day are identical', () => {
    // Factor 1 hits its 40-point ceiling at a raw load of 15, which two to
    // three severe triggers already exceed. Everything above that is flat.
    const severeDay = scenario({
      today: [trigger('sleep', 5), trigger('stress', 4), trigger('hormonal', 3)],
    });
    // Same three categories, so factor 2 is held constant and only intensity
    // differs: every trigger maxed, plus three more severe ones on top.
    const catastrophicDay = scenario({
      today: [
        trigger('sleep', 5, 1),
        trigger('stress', 5, 2),
        trigger('hormonal', 5, 3),
        trigger('sleep', 5, 4),
        trigger('stress', 5, 5),
        trigger('hormonal', 5, 6),
      ],
    });
    expect(calculateRisk(severeDay).factors.triggerLoad).toBe(40);
    expect(calculateRisk(catastrophicDay).factors.triggerLoad).toBe(40);
    // More than twice the trigger burden, indistinguishable on the gauge.
    expect(score(catastrophicDay)).toBeCloseTo(score(severeDay));
  });

  it('IMBALANCE 2: logging breadth outranks trigger intensity', () => {
    // Six trivial annoyances beat the single strongest known trigger, because
    // factor 2 pays for category variety without regard to severity.
    const sixTrivial = scenario({
      today: ALL_CATEGORIES.map((c) => trigger(c, 1)),
    });
    const oneSevere = scenario({ today: [trigger('sleep', 5)] });
    expect(score(sixTrivial)).toBeGreaterThan(score(oneSevere));
    expect(label(sixTrivial)).toBe('moderate');
    expect(label(oneSevere)).toBe('low');
  });

  it('IMBALANCE 3: an episodic user cannot reach critical however bad the day', () => {
    // With no episodes in the last 7 days, factors 3 and 4 are both zero, so
    // the score is capped at 60 — the population most in need of a warning
    // can never see the top band.
    const worstPossibleDay = scenario({
      today: ALL_CATEGORIES.map((c) => trigger(c, 5)),
      earlierThisWeek: ALL_CATEGORIES.map((c) => trigger(c, 5, 100)),
      averageEpisodeGapDays: 45,
      lastEpisodeHoursAgo: 45 * 24,
    });
    expect(score(worstPossibleDay)).toBe(60);
    expect(label(worstPossibleDay)).toBe('high');
    expect(label(worstPossibleDay)).not.toBe('critical');
  });

  it('IMBALANCE 4: a chronic user cannot reach low however calm the day', () => {
    // Factor 3 sits at 25 for the whole 7-day window, so the low band is
    // unreachable for exactly the users who open the app most.
    const calmestPossibleDay = scenario({
      earlierThisWeek: ALL_CATEGORIES.map((c) => trigger(c, 1, 150)),
      recentEpisodeCount: 3,
      averageEpisodeGapDays: 2,
      lastEpisodeHoursAgo: 150,
    });
    expect(calculateRisk(calmestPossibleDay).factors.triggerLoad).toBe(0);
    expect(score(calmestPossibleDay)).toBe(45);
    expect(label(calmestPossibleDay)).toBe('moderate');
  });

  it('IMBALANCE 5: a high score can be produced with no trigger input at all', () => {
    // 60 points — "high" — from past episodes and week-old category variety,
    // with nothing logged today. The gauge reports history, not risk.
    const noTriggersToday = scenario({
      earlierThisWeek: ALL_CATEGORIES.map((c) => trigger(c, 1, 100)),
      recentEpisodeCount: 3,
      averageEpisodeGapDays: 2,
      lastEpisodeHoursAgo: 6,
    });
    expect(calculateRisk(noTriggersToday).factors.triggerLoad).toBe(0);
    expect(label(noTriggersToday)).toBe('high');
  });

  it('IMBALANCE 6: averageEpisodeGapDays only gates, its value is ignored', () => {
    // A user attacking every other day and one attacking twice a year score
    // identically. The field is read solely as a null check.
    const veryFrequent = scenario({ recentEpisodeCount: 2, averageEpisodeGapDays: 2 });
    const veryRare = scenario({ recentEpisodeCount: 2, averageEpisodeGapDays: 180 });
    expect(score(veryFrequent)).toBe(score(veryRare));
  });

  it('IMBALANCE 7: today’s triggers are counted twice', () => {
    // risk-store passes the 24h window as recentTriggers and the 7d window as
    // triggerHistory, so a trigger logged today feeds factor 1 and factor 2.
    const loggedToday = scenario({ today: [trigger('sleep', 3)] });
    const loggedLastWeekOnly = scenario({ earlierThisWeek: [trigger('sleep', 3, 100)] });
    const contribution = score(loggedToday) - score(loggedLastWeekOnly);
    expect(calculateRisk(loggedToday).factors.triggerAccumulation).toBeCloseTo(
      calculateRisk(loggedLastWeekOnly).factors.triggerAccumulation
    );
    expect(contribution).toBeGreaterThan(0);
  });

  it('IMBALANCE 8: confidence is not represented, so one day of data scores like a year of it', () => {
    // The surprisal design defines cold-start tiers (<7 entries insufficient);
    // the heuristic has no equivalent and speaks with full confidence on day 1.
    const dayOneUser = scenario({
      today: [trigger('sleep', 5), trigger('stress', 5)],
    });
    const establishedUser = scenario({
      today: [trigger('sleep', 5), trigger('stress', 5)],
      earlierThisWeek: Array.from({ length: 40 }, (_, i) =>
        trigger(ALL_CATEGORIES[i % 6], 2, 24 + i)
      ),
    });
    expect(calculateRisk(dayOneUser).factors.triggerLoad).toBe(
      calculateRisk(establishedUser).factors.triggerLoad
    );
    expect(score(dayOneUser)).toBeGreaterThan(40);
  });
});
