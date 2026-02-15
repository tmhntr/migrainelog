import { calculateRisk, scoreToLabel, CATEGORY_WEIGHTS } from '../risk';
import { RiskInput } from '../../models/event';
import { Trigger } from '../../models/trigger';

function makeTrigger(
  category: Trigger['category'],
  severity: number,
  timestamp?: string
): Trigger {
  return {
    id: Math.random().toString(36),
    timestamp: timestamp ?? new Date().toISOString(),
    notes: null,
    eventType: 'trigger',
    category,
    severity,
  };
}

function emptyInput(): RiskInput {
  return {
    recentTriggers: [],
    triggerHistory: [],
    recentEpisodeCount: 0,
    averageEpisodeGapDays: null,
    lastEpisodeTimestamp: null,
  };
}

describe('scoreToLabel', () => {
  it('returns low for 0', () => {
    expect(scoreToLabel(0)).toBe('low');
  });

  it('returns low for 25', () => {
    expect(scoreToLabel(25)).toBe('low');
  });

  it('returns moderate for 26', () => {
    expect(scoreToLabel(26)).toBe('moderate');
  });

  it('returns moderate for 50', () => {
    expect(scoreToLabel(50)).toBe('moderate');
  });

  it('returns high for 51', () => {
    expect(scoreToLabel(51)).toBe('high');
  });

  it('returns high for 75', () => {
    expect(scoreToLabel(75)).toBe('high');
  });

  it('returns critical for 76', () => {
    expect(scoreToLabel(76)).toBe('critical');
  });

  it('returns critical for 100', () => {
    expect(scoreToLabel(100)).toBe('critical');
  });
});

describe('calculateRisk', () => {
  it('returns score 0 with no data', () => {
    const result = calculateRisk(emptyInput());
    expect(result.score).toBe(0);
    expect(result.label).toBe('low');
    expect(result.factors.triggerLoad).toBe(0);
    expect(result.factors.triggerAccumulation).toBe(0);
    expect(result.factors.episodeFrequency).toBe(0);
    expect(result.factors.recency).toBe(0);
  });

  describe('Factor 1: Recent Trigger Load', () => {
    it('calculates trigger load with category weights', () => {
      const input = emptyInput();
      input.recentTriggers = [makeTrigger('sleep', 3)]; // 3 * 1.5 = 4.5
      const result = calculateRisk(input);
      const expected = Math.min(40, 4.5 * (40 / 15));
      expect(result.factors.triggerLoad).toBeCloseTo(expected);
    });

    it('sums multiple triggers', () => {
      const input = emptyInput();
      input.recentTriggers = [
        makeTrigger('sleep', 2), // 2 * 1.5 = 3
        makeTrigger('stress', 3), // 3 * 1.3 = 3.9
      ];
      const result = calculateRisk(input);
      const rawScore = 3 + 3.9; // 6.9
      const expected = Math.min(40, rawScore * (40 / 15));
      expect(result.factors.triggerLoad).toBeCloseTo(expected);
    });

    it('caps trigger load at 40', () => {
      const input = emptyInput();
      // Create triggers that would exceed 40 points
      input.recentTriggers = [
        makeTrigger('sleep', 5), // 5 * 1.5 = 7.5
        makeTrigger('hormonal', 5), // 5 * 1.4 = 7.0
        makeTrigger('stress', 5), // 5 * 1.3 = 6.5
      ];
      const result = calculateRisk(input);
      expect(result.factors.triggerLoad).toBe(40);
    });

    it('applies correct weight for each category', () => {
      const categories: Trigger['category'][] = [
        'sleep',
        'hormonal',
        'stress',
        'food',
        'weather',
        'other',
      ];
      for (const category of categories) {
        const input = emptyInput();
        input.recentTriggers = [makeTrigger(category, 1)];
        const result = calculateRisk(input);
        const expected = Math.min(
          40,
          CATEGORY_WEIGHTS[category] * (40 / 15)
        );
        expect(result.factors.triggerLoad).toBeCloseTo(expected);
      }
    });
  });

  describe('Factor 2: Trigger Accumulation', () => {
    it('scores based on unique categories in history', () => {
      const input = emptyInput();
      input.triggerHistory = [
        makeTrigger('sleep', 1),
        makeTrigger('stress', 1),
        makeTrigger('food', 1),
      ];
      const result = calculateRisk(input);
      const expected = Math.min(20, 3 * (20 / 6));
      expect(result.factors.triggerAccumulation).toBeCloseTo(expected);
    });

    it('does not double-count same category', () => {
      const input = emptyInput();
      input.triggerHistory = [
        makeTrigger('sleep', 1),
        makeTrigger('sleep', 3),
        makeTrigger('sleep', 5),
      ];
      const result = calculateRisk(input);
      const expected = Math.min(20, 1 * (20 / 6));
      expect(result.factors.triggerAccumulation).toBeCloseTo(expected);
    });

    it('caps at 20 with all 6 categories', () => {
      const input = emptyInput();
      input.triggerHistory = [
        makeTrigger('sleep', 1),
        makeTrigger('stress', 1),
        makeTrigger('food', 1),
        makeTrigger('weather', 1),
        makeTrigger('hormonal', 1),
        makeTrigger('other', 1),
      ];
      const result = calculateRisk(input);
      expect(result.factors.triggerAccumulation).toBe(20);
    });
  });

  describe('Factor 3: Episode Frequency', () => {
    it('returns 0 when averageEpisodeGapDays is null', () => {
      const input = emptyInput();
      input.recentEpisodeCount = 5;
      input.averageEpisodeGapDays = null;
      const result = calculateRisk(input);
      expect(result.factors.episodeFrequency).toBe(0);
    });

    it('returns 25 when recentEpisodeCount >= 3', () => {
      const input = emptyInput();
      input.recentEpisodeCount = 3;
      input.averageEpisodeGapDays = 2;
      const result = calculateRisk(input);
      expect(result.factors.episodeFrequency).toBe(25);
    });

    it('returns 25 when recentEpisodeCount > 3', () => {
      const input = emptyInput();
      input.recentEpisodeCount = 5;
      input.averageEpisodeGapDays = 1;
      const result = calculateRisk(input);
      expect(result.factors.episodeFrequency).toBe(25);
    });

    it('scales linearly below 3 episodes', () => {
      const input = emptyInput();
      input.recentEpisodeCount = 1;
      input.averageEpisodeGapDays = 5;
      const result = calculateRisk(input);
      const expected = (1 / 3) * 25;
      expect(result.factors.episodeFrequency).toBeCloseTo(expected);
    });

    it('returns 0 for 0 recent episodes with gap data', () => {
      const input = emptyInput();
      input.recentEpisodeCount = 0;
      input.averageEpisodeGapDays = 10;
      const result = calculateRisk(input);
      expect(result.factors.episodeFrequency).toBe(0);
    });
  });

  describe('Factor 4: Recency', () => {
    it('returns 0 when lastEpisodeTimestamp is null', () => {
      const result = calculateRisk(emptyInput());
      expect(result.factors.recency).toBe(0);
    });

    it('returns 15 when last episode was within 24 hours', () => {
      const input = emptyInput();
      const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
      input.lastEpisodeTimestamp = tenHoursAgo.toISOString();
      const result = calculateRisk(input);
      expect(result.factors.recency).toBe(15);
    });

    it('returns 10 when last episode was 24-48 hours ago', () => {
      const input = emptyInput();
      const thirtyHoursAgo = new Date(Date.now() - 30 * 60 * 60 * 1000);
      input.lastEpisodeTimestamp = thirtyHoursAgo.toISOString();
      const result = calculateRisk(input);
      expect(result.factors.recency).toBe(10);
    });

    it('returns 5 when last episode was 48-72 hours ago', () => {
      const input = emptyInput();
      const sixtyHoursAgo = new Date(Date.now() - 60 * 60 * 60 * 1000);
      input.lastEpisodeTimestamp = sixtyHoursAgo.toISOString();
      const result = calculateRisk(input);
      expect(result.factors.recency).toBe(5);
    });

    it('returns 0 when last episode was more than 72 hours ago', () => {
      const input = emptyInput();
      const fourDaysAgo = new Date(Date.now() - 96 * 60 * 60 * 1000);
      input.lastEpisodeTimestamp = fourDaysAgo.toISOString();
      const result = calculateRisk(input);
      expect(result.factors.recency).toBe(0);
    });
  });

  describe('Combined scoring', () => {
    it('achieves score 100 when all factors are maxed', () => {
      const input: RiskInput = {
        recentTriggers: [
          makeTrigger('sleep', 5),
          makeTrigger('hormonal', 5),
          makeTrigger('stress', 5),
          makeTrigger('food', 5),
        ],
        triggerHistory: [
          makeTrigger('sleep', 1),
          makeTrigger('stress', 1),
          makeTrigger('food', 1),
          makeTrigger('weather', 1),
          makeTrigger('hormonal', 1),
          makeTrigger('other', 1),
        ],
        recentEpisodeCount: 5,
        averageEpisodeGapDays: 1,
        lastEpisodeTimestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      };
      const result = calculateRisk(input);
      expect(result.score).toBe(100);
      expect(result.label).toBe('critical');
      expect(result.factors.triggerLoad).toBe(40);
      expect(result.factors.triggerAccumulation).toBe(20);
      expect(result.factors.episodeFrequency).toBe(25);
      expect(result.factors.recency).toBe(15);
    });

    it('sums factors correctly with partial data', () => {
      const input: RiskInput = {
        recentTriggers: [makeTrigger('other', 1)], // 0.8 * 40/15 = ~2.13
        triggerHistory: [makeTrigger('other', 1)], // 1 unique => 1 * 20/6 = ~3.33
        recentEpisodeCount: 1,
        averageEpisodeGapDays: 7,
        lastEpisodeTimestamp: new Date(
          Date.now() - 30 * 60 * 60 * 1000
        ).toISOString(), // 30h ago => 10
      };
      const result = calculateRisk(input);
      const expectedF1 = 0.8 * (40 / 15);
      const expectedF2 = 1 * (20 / 6);
      const expectedF3 = (1 / 3) * 25;
      const expectedF4 = 10;
      const expectedScore = expectedF1 + expectedF2 + expectedF3 + expectedF4;
      expect(result.score).toBeCloseTo(expectedScore);
    });

    it('clamps score to 0 minimum', () => {
      // With empty input, score should be exactly 0
      const result = calculateRisk(emptyInput());
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });
});
