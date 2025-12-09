import { describe, it, expect } from 'vitest';
import { episodeSchema, signInSchema, signUpSchema } from '../validation';

describe('validation schemas', () => {
  describe('episodeSchema', () => {
    it('should validate a complete episode', () => {
      const validEpisode = {
        start_time: '2025-01-01T10:00:00Z',
        end_time: '2025-01-01T14:00:00Z',
        severity: 7,
        pain_location: ['forehead', 'temples'],
        symptoms: ['nausea', 'light_sensitivity'],
        triggers: ['stress', 'lack_of_sleep'],
        medications: [
          {
            name: 'Ibuprofen',
            dosage: '400mg',
            time_taken: '2025-01-01T10:30:00Z',
            effectiveness: 3,
          },
        ],
        notes: 'Test episode',
        contributing_factors: {
          hours_of_sleep: 6,
          water_intake_oz: 64,
          weather_conditions: 'Rainy',
          stress_level: 8,
        },
      };

      const result = episodeSchema.safeParse(validEpisode);
      expect(result.success).toBe(true);
    });

    it('should validate a minimal episode', () => {
      const minimalEpisode = {
        start_time: '2025-01-01T10:00:00Z',
        severity: 5,
        pain_location: ['back_of_head'],
      };

      const result = episodeSchema.safeParse(minimalEpisode);
      expect(result.success).toBe(true);
    });

    it('should reject episode without start_time', () => {
      const invalidEpisode = {
        severity: 7,
        pain_location: ['forehead'],
      };

      const result = episodeSchema.safeParse(invalidEpisode);
      expect(result.success).toBe(false);
    });

    it('should reject episode without pain_location', () => {
      const invalidEpisode = {
        start_time: '2025-01-01T10:00:00Z',
        severity: 7,
        pain_location: [],
      };

      const result = episodeSchema.safeParse(invalidEpisode);
      expect(result.success).toBe(false);
    });

    it('should reject severity below 1', () => {
      const invalidEpisode = {
        start_time: '2025-01-01T10:00:00Z',
        severity: 0,
        pain_location: ['forehead'],
      };

      const result = episodeSchema.safeParse(invalidEpisode);
      expect(result.success).toBe(false);
    });

    it('should reject severity above 10', () => {
      const invalidEpisode = {
        start_time: '2025-01-01T10:00:00Z',
        severity: 11,
        pain_location: ['forehead'],
      };

      const result = episodeSchema.safeParse(invalidEpisode);
      expect(result.success).toBe(false);
    });

    it('should reject invalid pain location', () => {
      const invalidEpisode = {
        start_time: '2025-01-01T10:00:00Z',
        severity: 7,
        pain_location: ['invalid_location'],
      };

      const result = episodeSchema.safeParse(invalidEpisode);
      expect(result.success).toBe(false);
    });

    it('should validate medication with all fields', () => {
      const episodeWithMeds = {
        start_time: '2025-01-01T10:00:00Z',
        severity: 7,
        pain_location: ['forehead'],
        medications: [
          {
            name: 'Aspirin',
            dosage: '500mg',
            time_taken: '2025-01-01T10:30:00Z',
            effectiveness: 4,
          },
        ],
      };

      const result = episodeSchema.safeParse(episodeWithMeds);
      expect(result.success).toBe(true);
    });

    it('should reject medication without name', () => {
      const episodeWithInvalidMeds = {
        start_time: '2025-01-01T10:00:00Z',
        severity: 7,
        pain_location: ['forehead'],
        medications: [
          {
            dosage: '500mg',
            time_taken: '2025-01-01T10:30:00Z',
          },
        ],
      };

      const result = episodeSchema.safeParse(episodeWithInvalidMeds);
      expect(result.success).toBe(false);
    });

    it('should reject medication effectiveness outside 1-5 range', () => {
      const episodeWithInvalidEffectiveness = {
        start_time: '2025-01-01T10:00:00Z',
        severity: 7,
        pain_location: ['forehead'],
        medications: [
          {
            name: 'Aspirin',
            dosage: '500mg',
            time_taken: '2025-01-01T10:30:00Z',
            effectiveness: 6,
          },
        ],
      };

      const result = episodeSchema.safeParse(episodeWithInvalidEffectiveness);
      expect(result.success).toBe(false);
    });

    it('should validate contributing factors', () => {
      const episodeWithFactors = {
        start_time: '2025-01-01T10:00:00Z',
        severity: 7,
        pain_location: ['forehead'],
        contributing_factors: {
          hours_of_sleep: 7.5,
          water_intake_oz: 64,
          weather_conditions: 'Sunny',
          stress_level: 5,
        },
      };

      const result = episodeSchema.safeParse(episodeWithFactors);
      expect(result.success).toBe(true);
    });

    it('should reject hours_of_sleep above 24', () => {
      const episodeWithInvalidSleep = {
        start_time: '2025-01-01T10:00:00Z',
        severity: 7,
        pain_location: ['forehead'],
        contributing_factors: {
          hours_of_sleep: 25,
        },
      };

      const result = episodeSchema.safeParse(episodeWithInvalidSleep);
      expect(result.success).toBe(false);
    });

    it('should reject stress_level above 10', () => {
      const episodeWithInvalidStress = {
        start_time: '2025-01-01T10:00:00Z',
        severity: 7,
        pain_location: ['forehead'],
        contributing_factors: {
          stress_level: 11,
        },
      };

      const result = episodeSchema.safeParse(episodeWithInvalidStress);
      expect(result.success).toBe(false);
    });
  });

  describe('signInSchema', () => {
    it('should validate correct email and password', () => {
      const validSignIn = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = signInSchema.safeParse(validSignIn);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidSignIn = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = signInSchema.safeParse(invalidSignIn);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('should reject password shorter than 6 characters', () => {
      const invalidSignIn = {
        email: 'test@example.com',
        password: '12345',
      };

      const result = signInSchema.safeParse(invalidSignIn);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Password must be at least 6 characters'
        );
      }
    });
  });

  describe('signUpSchema', () => {
    it('should validate matching passwords', () => {
      const validSignUp = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = signUpSchema.safeParse(validSignUp);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const invalidSignUp = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      };

      const result = signUpSchema.safeParse(invalidSignUp);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords don't match");
      }
    });

    it('should reject invalid email in signup', () => {
      const invalidSignUp = {
        email: 'invalid',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = signUpSchema.safeParse(invalidSignUp);
      expect(result.success).toBe(false);
    });

    it('should reject short password in signup', () => {
      const invalidSignUp = {
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123',
      };

      const result = signUpSchema.safeParse(invalidSignUp);
      expect(result.success).toBe(false);
    });
  });
});
