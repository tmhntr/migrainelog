import { z } from 'zod';

/**
 * Validation Utilities
 *
 * Zod schemas for form validation
 */

const painLocationEnum = z.enum([
  'forehead',
  'temples',
  'back_of_head',
  'top_of_head',
  'left_side',
  'right_side',
  'eyes',
  'jaw',
  'neck',
]);

const symptomEnum = z.enum([
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
]);

const triggerEnum = z.enum([
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
]);

const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  time_taken: z.string(), // Changed to string for form handling, will be converted to Date
  effectiveness: z.number().min(1).max(5).optional(),
});

const contributingFactorsSchema = z.object({
  hours_of_sleep: z.number().min(0).max(24).optional(),
  water_intake_oz: z.number().min(0).optional(),
  weather_conditions: z.string().optional(),
  stress_level: z.number().min(1).max(10).optional(),
});

export const episodeSchema = z.object({
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().optional(),
  severity: z.number().min(1, 'Minimum severity is 1').max(10, 'Maximum severity is 10'),
  pain_location: z.array(painLocationEnum).min(1, 'Select at least one pain location'),
  symptoms: z.array(symptomEnum).default([]),
  triggers: z.array(triggerEnum).default([]),
  medications: z.array(medicationSchema).default([]),
  notes: z.string().optional(),
  contributing_factors: contributingFactorsSchema.optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
