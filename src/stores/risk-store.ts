import { create } from 'zustand';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { RiskLabel, RiskFactors } from '../models/event';
import { calculateRisk } from '../utils/risk';
import { getWindowStart } from '../utils/date-helpers';
import {
  listTriggersInWindow,
  countEpisodesInWindow,
  getLastEpisodeTimestamp,
  getAverageEpisodeGap,
} from '../db/queries';

interface RiskState {
  score: number;
  label: RiskLabel;
  factors: RiskFactors;
  lastCalculated: string | null;
  recalculate: (db: SQLiteDatabase) => Promise<void>;
}

export const useRiskStore = create<RiskState>((set) => ({
  score: 0,
  label: 'low',
  factors: {
    triggerLoad: 0,
    triggerAccumulation: 0,
    episodeFrequency: 0,
    recency: 0,
  },
  lastCalculated: null,

  recalculate: async (db) => {
    const since24h = getWindowStart(24);
    const since7d = getWindowStart(24 * 7);

    const [recentTriggers, triggerHistory, recentEpisodeCount, lastEpisode, avgGap] =
      await Promise.all([
        listTriggersInWindow(db, since24h),
        listTriggersInWindow(db, since7d),
        countEpisodesInWindow(db, since7d),
        getLastEpisodeTimestamp(db),
        getAverageEpisodeGap(db),
      ]);

    const result = calculateRisk({
      recentTriggers,
      triggerHistory,
      recentEpisodeCount,
      averageEpisodeGapDays: avgGap,
      lastEpisodeTimestamp: lastEpisode,
    });

    set({
      score: result.score,
      label: result.label,
      factors: result.factors,
      lastCalculated: new Date().toISOString(),
    });
  },
}));
