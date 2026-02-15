import { Episode } from '../models/episode';
import { Trigger } from '../models/trigger';
import { Treatment } from '../models/treatment';
import { TriggerCategory } from '../models/trigger';

export interface DashboardStats {
  episodeCount7d: number;
  episodeCount30d: number;
  topTriggerCategory: string | null;
  treatmentEffectivenessPercent: number | null;
}

export function computeDashboardStats(params: {
  episodes: Episode[];
  triggers: Trigger[];
  treatments: Treatment[];
}): DashboardStats {
  const { episodes, triggers, treatments } = params;
  const now = new Date();

  const msIn7d = 7 * 24 * 60 * 60 * 1000;
  const msIn30d = 30 * 24 * 60 * 60 * 1000;

  // Count episodes in last 7d and 30d
  const episodeCount7d = episodes.filter((e) => {
    const diff = now.getTime() - new Date(e.timestamp).getTime();
    return diff >= 0 && diff <= msIn7d;
  }).length;

  const episodeCount30d = episodes.filter((e) => {
    const diff = now.getTime() - new Date(e.timestamp).getTime();
    return diff >= 0 && diff <= msIn30d;
  }).length;

  // Find most frequent trigger category
  let topTriggerCategory: string | null = null;
  if (triggers.length > 0) {
    const categoryCounts = new Map<TriggerCategory, number>();
    for (const trigger of triggers) {
      const count = categoryCounts.get(trigger.category) ?? 0;
      categoryCounts.set(trigger.category, count + 1);
    }
    let maxCount = 0;
    for (const [category, count] of categoryCounts) {
      if (count > maxCount) {
        maxCount = count;
        topTriggerCategory = category;
      }
    }
  }

  // Calculate treatment effectiveness
  let treatmentEffectivenessPercent: number | null = null;
  const ratedTreatments = treatments.filter((t) => t.effective !== null);
  if (ratedTreatments.length > 0) {
    const effectiveCount = ratedTreatments.filter((t) => t.effective === true).length;
    treatmentEffectivenessPercent = Math.round(
      (effectiveCount / ratedTreatments.length) * 100
    );
  }

  return {
    episodeCount7d,
    episodeCount30d,
    topTriggerCategory,
    treatmentEffectivenessPercent,
  };
}
