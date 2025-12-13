/**
 * Database Helper Functions
 *
 * Type-safe helper functions for working with the Supabase database
 */

import type { TablesInsert, TablesUpdate } from '@/types/database';
import type { Medication } from '@/types/episode';

type EpisodeInsert = TablesInsert<'episodes'>;
type EpisodeUpdate = TablesUpdate<'episodes'>;

/**
 * Converts a Medication object to the JSONB format expected by the database
 */
export function serializeMedication(medication: Medication): string {
  return JSON.stringify({
    name: medication.name,
    dosage: medication.dosage,
    time_taken: medication.time_taken,
    effectiveness: medication.effectiveness,
  });
}

/**
 * Converts an array of Medication objects to JSONB
 */
export function serializeMedications(medications: Medication[]): Array<{
  name: string;
  dosage: string;
  time_taken: string;
  effectiveness?: number;
}> {
  return medications.map(med => ({
    name: med.name,
    dosage: med.dosage,
    time_taken: med.time_taken.toISOString(),
    effectiveness: med.effectiveness,
  }));
}

/**
 * Parses medications from JSONB to Medication array
 */
export function parseMedications(medications: unknown): Medication[] {
  if (!medications) return [];
  if (Array.isArray(medications)) {
    return medications as Medication[];
  }
  return [];
}

/**
 * Validates severity value (1-10)
 */
export function isValidSeverity(severity: number): boolean {
  return severity >= 1 && severity <= 10 && Number.isInteger(severity);
}

/**
 * Validates episode time range
 */
export function isValidTimeRange(startTime: Date | string, endTime?: Date | string | null): boolean {
  if (!endTime) return true;

  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;

  return end >= start;
}

/**
 * Calculates episode duration in hours
 */
export function calculateDuration(startTime: Date | string, endTime?: Date | string | null): number | null {
  if (!endTime) return null;

  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;

  const durationMs = end.getTime() - start.getTime();
  return durationMs / (1000 * 60 * 60); // Convert to hours
}

/**
 * Formats duration in a human-readable format
 */
export function formatDuration(hours: number | null): string {
  if (hours === null) return 'Ongoing';

  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  if (hours < 24) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) {
      return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
    }
    return `${wholeHours}h ${minutes}m`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  if (remainingHours === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  return `${days}d ${remainingHours}h`;
}

/**
 * Creates a properly formatted episode insert object
 */
export function createEpisodeInsert(
  userId: string,
  data: {
    startTime: Date | string;
    endTime?: Date | string | null;
    severity: number;
    painLocation?: string[];
    symptoms?: string[];
    triggers?: string[];
    medications?: Medication[];
    notes?: string | null;
  }
): EpisodeInsert {
  return {
    user_id: userId,
    start_time: typeof data.startTime === 'string' ? data.startTime : data.startTime.toISOString(),
    end_time: data.endTime
      ? typeof data.endTime === 'string'
        ? data.endTime
        : data.endTime.toISOString()
      : null,
    severity: data.severity,
    pain_location: data.painLocation || [],
    symptoms: data.symptoms || [],
    triggers: data.triggers || [],
    medications: data.medications ? serializeMedications(data.medications) : [],
    notes: data.notes || null,
  };
}

/**
 * Creates a properly formatted episode update object
 */
export function createEpisodeUpdate(data: {
  startTime?: Date | string;
  endTime?: Date | string | null;
  severity?: number;
  painLocation?: string[];
  symptoms?: string[];
  triggers?: string[];
  medications?: Medication[];
  notes?: string | null;
}): EpisodeUpdate {
  const update: EpisodeUpdate = {};

  if (data.startTime !== undefined) {
    update.start_time =
      typeof data.startTime === 'string' ? data.startTime : data.startTime.toISOString();
  }

  if (data.endTime !== undefined) {
    update.end_time = data.endTime
      ? typeof data.endTime === 'string'
        ? data.endTime
        : data.endTime.toISOString()
      : null;
  }

  if (data.severity !== undefined) update.severity = data.severity;
  if (data.painLocation !== undefined) update.pain_location = data.painLocation;
  if (data.symptoms !== undefined) update.symptoms = data.symptoms;
  if (data.triggers !== undefined) update.triggers = data.triggers;
  if (data.medications !== undefined) {
    update.medications = serializeMedications(data.medications);
  }
  if (data.notes !== undefined) update.notes = data.notes;

  return update;
}

/**
 * Valid pain location values
 */
export const VALID_PAIN_LOCATIONS = [
  'forehead',
  'temples',
  'back_of_head',
  'top_of_head',
  'left_side',
  'right_side',
  'eyes',
  'jaw',
  'neck',
] as const;

/**
 * Valid symptom values
 */
export const VALID_SYMPTOMS = [
  'nausea',
  'vomiting',
  'light_sensitivity',
  'sound_sensitivity',
  'smell_sensitivity',
  'visual_disturbances',
  'aura',
  'dizziness',
  'fatigue',
  'confusion',
  'irritability',
] as const;

/**
 * Valid trigger values
 */
export const VALID_TRIGGERS = [
  'stress',
  'lack_of_sleep',
  'weather_change',
  'bright_lights',
  'loud_noises',
  'strong_smells',
  'alcohol',
  'caffeine',
  'dehydration',
  'skipped_meal',
  'hormonal_changes',
  'exercise',
  'screen_time',
] as const;

/**
 * Validates pain location values
 */
export function validatePainLocation(location: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return VALID_PAIN_LOCATIONS.includes(location as any);
}

/**
 * Validates symptom values
 */
export function validateSymptom(symptom: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return VALID_SYMPTOMS.includes(symptom as any);
}

/**
 * Validates trigger values
 */
export function validateTrigger(trigger: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return VALID_TRIGGERS.includes(trigger as any);
}

/**
 * Validates an array of pain locations
 */
export function validatePainLocations(locations: string[]): boolean {
  return locations.every(validatePainLocation);
}

/**
 * Validates an array of symptoms
 */
export function validateSymptoms(symptoms: string[]): boolean {
  return symptoms.every(validateSymptom);
}

/**
 * Validates an array of triggers
 */
export function validateTriggers(triggers: string[]): boolean {
  return triggers.every(validateTrigger);
}

/**
 * Human-readable labels for pain locations
 */
export const PAIN_LOCATION_LABELS: Record<string, string> = {
  forehead: 'Forehead',
  temples: 'Temples',
  back_of_head: 'Back of Head',
  top_of_head: 'Top of Head',
  left_side: 'Left Side',
  right_side: 'Right Side',
  eyes: 'Eyes',
  jaw: 'Jaw',
  neck: 'Neck',
};

/**
 * Human-readable labels for symptoms
 */
export const SYMPTOM_LABELS: Record<string, string> = {
  nausea: 'Nausea',
  vomiting: 'Vomiting',
  light_sensitivity: 'Light Sensitivity',
  sound_sensitivity: 'Sound Sensitivity',
  smell_sensitivity: 'Smell Sensitivity',
  visual_disturbances: 'Visual Disturbances',
  aura: 'Aura',
  dizziness: 'Dizziness',
  fatigue: 'Fatigue',
  confusion: 'Confusion',
  irritability: 'Irritability',
};

/**
 * Human-readable labels for triggers
 */
export const TRIGGER_LABELS: Record<string, string> = {
  stress: 'Stress',
  lack_of_sleep: 'Lack of Sleep',
  weather_change: 'Weather Change',
  bright_lights: 'Bright Lights',
  loud_noises: 'Loud Noises',
  strong_smells: 'Strong Smells',
  alcohol: 'Alcohol',
  caffeine: 'Caffeine',
  dehydration: 'Dehydration',
  skipped_meal: 'Skipped Meal',
  hormonal_changes: 'Hormonal Changes',
  exercise: 'Exercise',
  screen_time: 'Screen Time',
};
