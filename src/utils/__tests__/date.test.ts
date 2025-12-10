import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatTimeAgo,
  calculateDuration,
  getDurationInHours,
} from '../date';

describe('date utilities', () => {
  beforeEach(() => {
    // Set a fixed date for consistent testing
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = new Date('2025-01-01T10:00:00Z');
      const result = formatDate(date);
      expect(result).toBe('January 1st, 2025');
    });

    it('should format date with custom format', () => {
      const date = new Date('2025-01-01T10:00:00Z');
      const result = formatDate(date, 'yyyy-MM-dd');
      expect(result).toBe('2025-01-01');
    });

    it('should format date with another custom format', () => {
      const date = new Date('2025-06-15T14:30:00Z');
      const result = formatDate(date, 'MMM dd, yyyy');
      expect(result).toBe('Jun 15, 2025');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = new Date('2025-01-01T10:30:00Z');
      const result = formatDateTime(date);
      // The exact format may vary based on locale, but it should include both date and time
      expect(result).toContain('January 1st, 2025');
      expect(result).toContain('10:30');
    });
  });

  describe('formatTimeAgo', () => {
    it('should format time in the past', () => {
      const date = new Date('2025-01-14T12:00:00Z'); // 1 day ago
      const result = formatTimeAgo(date);
      expect(result).toBe('1 day ago');
    });

    it('should format time for hours ago', () => {
      const date = new Date('2025-01-15T10:00:00Z'); // 2 hours ago
      const result = formatTimeAgo(date);
      expect(result).toBe('about 2 hours ago');
    });

    it('should format time for minutes ago', () => {
      const date = new Date('2025-01-15T11:45:00Z'); // 15 minutes ago
      const result = formatTimeAgo(date);
      expect(result).toBe('15 minutes ago');
    });

    it('should format time for multiple days ago', () => {
      const date = new Date('2025-01-10T12:00:00Z'); // 5 days ago
      const result = formatTimeAgo(date);
      expect(result).toBe('5 days ago');
    });
  });

  describe('calculateDuration', () => {
    it('should calculate duration in hours and minutes', () => {
      const start = new Date('2025-01-01T10:00:00Z');
      const end = new Date('2025-01-01T12:30:00Z');
      const result = calculateDuration(start, end);
      expect(result).toBe('2 hours 30 minutes');
    });

    it('should calculate duration for less than an hour', () => {
      const start = new Date('2025-01-01T10:00:00Z');
      const end = new Date('2025-01-01T10:45:00Z');
      const result = calculateDuration(start, end);
      expect(result).toBe('45 minutes');
    });

    it('should calculate duration for exactly one hour', () => {
      const start = new Date('2025-01-01T10:00:00Z');
      const end = new Date('2025-01-01T11:00:00Z');
      const result = calculateDuration(start, end);
      expect(result).toBe('1 hour');
    });

    it('should calculate duration for multiple hours', () => {
      const start = new Date('2025-01-01T10:00:00Z');
      const end = new Date('2025-01-01T14:00:00Z');
      const result = calculateDuration(start, end);
      expect(result).toBe('4 hours');
    });

    it('should calculate duration with exact minutes', () => {
      const start = new Date('2025-01-01T10:15:00Z');
      const end = new Date('2025-01-01T11:45:00Z');
      const result = calculateDuration(start, end);
      expect(result).toBe('1 hour 30 minutes');
    });
  });

  describe('getDurationInHours', () => {
    it('should calculate duration in hours as decimal', () => {
      const start = new Date('2025-01-01T10:00:00Z');
      const end = new Date('2025-01-01T12:30:00Z');
      const result = getDurationInHours(start, end);
      expect(result).toBe(2.5);
    });

    it('should calculate duration for less than an hour', () => {
      const start = new Date('2025-01-01T10:00:00Z');
      const end = new Date('2025-01-01T10:30:00Z');
      const result = getDurationInHours(start, end);
      expect(result).toBe(0.5);
    });

    it('should calculate duration for exactly one hour', () => {
      const start = new Date('2025-01-01T10:00:00Z');
      const end = new Date('2025-01-01T11:00:00Z');
      const result = getDurationInHours(start, end);
      expect(result).toBe(1);
    });

    it('should calculate duration for multiple hours', () => {
      const start = new Date('2025-01-01T10:00:00Z');
      const end = new Date('2025-01-01T18:00:00Z');
      const result = getDurationInHours(start, end);
      expect(result).toBe(8);
    });

    it('should calculate fractional hours', () => {
      const start = new Date('2025-01-01T10:00:00Z');
      const end = new Date('2025-01-01T10:45:00Z');
      const result = getDurationInHours(start, end);
      expect(result).toBe(0.75);
    });

    it('should handle same start and end time', () => {
      const start = new Date('2025-01-01T10:00:00Z');
      const end = new Date('2025-01-01T10:00:00Z');
      const result = getDurationInHours(start, end);
      expect(result).toBe(0);
    });
  });
});
