export type EventType = 'trigger' | 'episode' | 'treatment';

export interface BaseEvent {
  id: string;
  timestamp: string; // ISO-8601
  notes: string | null;
  eventType: EventType;
}

export interface ListOptions {
  limit?: number;
  offset?: number;
  since?: string; // ISO-8601
  until?: string; // ISO-8601
  category?: string;
}

export type RiskLabel = 'low' | 'moderate' | 'high' | 'critical';

export interface RiskFactors {
  triggerLoad: number;
  triggerAccumulation: number;
  episodeFrequency: number;
  recency: number;
}

export interface RiskInput {
  recentTriggers: import('./trigger').Trigger[];
  triggerHistory: import('./trigger').Trigger[];
  recentEpisodeCount: number;
  averageEpisodeGapDays: number | null;
  lastEpisodeTimestamp: string | null;
}

export interface RiskResult {
  score: number;
  label: RiskLabel;
  factors: RiskFactors;
}
