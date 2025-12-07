/**
 * Episode Types
 *
 * TypeScript types and interfaces for migraine episodes
 */

export interface Episode {
  id: string;
  user_id: string;
  start_time: Date;
  end_time?: Date | null;
  severity: number; // 1-10 scale
  pain_location: PainLocation[];
  symptoms: Symptom[];
  triggers: Trigger[];
  medications: Medication[];
  notes?: string | null;
  contributing_factors?: ContributingFactors;
  created_at: Date;
  updated_at: Date;
}

export type PainLocation =
  | 'forehead'
  | 'temples'
  | 'back_of_head'
  | 'top_of_head'
  | 'left_side'
  | 'right_side'
  | 'eyes'
  | 'jaw'
  | 'neck';

export type Symptom =
  | 'nausea'
  | 'vomiting'
  | 'light_sensitivity'
  | 'sound_sensitivity'
  | 'smell_sensitivity'
  | 'visual_disturbances'
  | 'aura'
  | 'dizziness'
  | 'fatigue'
  | 'confusion'
  | 'irritability';

export type Trigger =
  | 'stress'
  | 'lack_of_sleep'
  | 'weather_change'
  | 'bright_lights'
  | 'loud_noises'
  | 'strong_smells'
  | 'alcohol'
  | 'caffeine'
  | 'dehydration'
  | 'skipped_meal'
  | 'hormonal_changes'
  | 'exercise'
  | 'screen_time';

export interface Medication {
  name: string;
  dosage: string;
  time_taken: Date;
  effectiveness?: number; // 1-5 scale
}

export interface MedicationFormData {
  name: string;
  dosage: string;
  time_taken: string; // String in form, Date in Episode
  effectiveness?: number; // 1-5 scale
}

export interface ContributingFactors {
  hours_of_sleep?: number;
  water_intake_oz?: number;
  weather_conditions?: string;
  stress_level?: number; // 1-10 scale
}

export interface EpisodeFormData {
  start_time: string;
  end_time?: string;
  severity: number;
  pain_location: PainLocation[];
  symptoms: Symptom[];
  triggers: Trigger[];
  medications: MedicationFormData[];
  notes?: string;
  contributing_factors?: ContributingFactors;
}

export interface EpisodeStats {
  total_episodes: number;
  average_severity: number;
  average_duration: number; // in hours
  most_common_triggers: { trigger: Trigger; count: number }[];
  most_common_symptoms: { symptom: Symptom; count: number }[];
  episodes_per_month: { month: string; count: number }[];
}
