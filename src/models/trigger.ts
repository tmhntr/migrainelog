import { BaseEvent } from './event';

export const TRIGGER_CATEGORIES = [
  'sleep',
  'stress',
  'food',
  'weather',
  'hormonal',
  'other',
] as const;

export type TriggerCategory = (typeof TRIGGER_CATEGORIES)[number];

export interface Trigger extends BaseEvent {
  eventType: 'trigger';
  category: TriggerCategory;
  severity: number; // 1-5
}

export interface TriggerInsert {
  timestamp: string;
  notes?: string | null;
  category: TriggerCategory;
  severity: number;
}
