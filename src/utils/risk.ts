import { RiskInput, RiskResult, RiskLabel } from '../models/event';
import { TriggerCategory } from '../models/trigger';
import { hoursBetween } from './date-helpers';

export const CATEGORY_WEIGHTS: Record<TriggerCategory, number> = {
  sleep: 1.5,
  hormonal: 1.4,
  stress: 1.3,
  food: 1.1,
  weather: 1.0,
  other: 0.8,
};

const NORMALIZATION_CEILING = 15;
const MAX_CATEGORIES = 6;

export function scoreToLabel(score: number): RiskLabel {
  if (score <= 25) return 'low';
  if (score <= 50) return 'moderate';
  if (score <= 75) return 'high';
  return 'critical';
}

export function calculateRisk(input: RiskInput): RiskResult {
  const {
    recentTriggers,
    triggerHistory,
    recentEpisodeCount,
    averageEpisodeGapDays,
    lastEpisodeTimestamp,
  } = input;

  // Factor 1: Recent Trigger Load (0-40 points)
  const rawScore = recentTriggers.reduce((sum, trigger) => {
    const weight = CATEGORY_WEIGHTS[trigger.category];
    return sum + trigger.severity * weight;
  }, 0);
  const factor1 = Math.min(40, rawScore * (40 / NORMALIZATION_CEILING));

  // Factor 2: Trigger Accumulation (0-20 points)
  const uniqueCategories = new Set(triggerHistory.map((t) => t.category)).size;
  const factor2 = Math.min(20, uniqueCategories * (20 / MAX_CATEGORIES));

  // Factor 3: Episode Frequency (0-25 points)
  let factor3: number;
  if (averageEpisodeGapDays === null) {
    factor3 = 0;
  } else if (recentEpisodeCount >= 3) {
    factor3 = 25;
  } else {
    factor3 = Math.min(25, (recentEpisodeCount / 3) * 25);
  }

  // Factor 4: Recency (0-15 points)
  let factor4: number;
  if (lastEpisodeTimestamp === null) {
    factor4 = 0;
  } else {
    const hoursSince = hoursBetween(lastEpisodeTimestamp, new Date());
    if (hoursSince < 24) {
      factor4 = 15;
    } else if (hoursSince < 48) {
      factor4 = 10;
    } else if (hoursSince < 72) {
      factor4 = 5;
    } else {
      factor4 = 0;
    }
  }

  const score = Math.min(100, Math.max(0, factor1 + factor2 + factor3 + factor4));

  return {
    score,
    label: scoreToLabel(score),
    factors: {
      triggerLoad: factor1,
      triggerAccumulation: factor2,
      episodeFrequency: factor3,
      recency: factor4,
    },
  };
}
