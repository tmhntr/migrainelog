import { BaseEvent } from './event';

export const COMMON_SYMPTOMS = [
  'Throbbing pain',
  'Nausea',
  'Light sensitivity',
  'Sound sensitivity',
  'Blurred vision',
  'Dizziness',
  'Fatigue',
  'Neck stiffness',
  'Tingling',
  'Difficulty concentrating',
] as const;

export interface Episode extends BaseEvent {
  eventType: 'episode';
  severity: number; // 1-10
  durationMinutes: number | null;
  symptoms: string[];
  aura: boolean;
}

export interface EpisodeInsert {
  timestamp: string;
  notes?: string | null;
  severity: number;
  durationMinutes?: number | null;
  symptoms?: string[];
  aura?: boolean;
}
