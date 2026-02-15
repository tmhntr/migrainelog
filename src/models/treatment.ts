import { BaseEvent } from './event';

export const TREATMENT_TYPES = [
  'medication',
  'rest',
  'hydration',
  'caffeine',
  'other',
] as const;

export type TreatmentType = (typeof TREATMENT_TYPES)[number];

export interface Treatment extends BaseEvent {
  eventType: 'treatment';
  type: TreatmentType;
  name: string;
  effective: boolean | null;
}

export interface TreatmentInsert {
  timestamp: string;
  notes?: string | null;
  type: TreatmentType;
  name: string;
  effective?: boolean | null;
}
