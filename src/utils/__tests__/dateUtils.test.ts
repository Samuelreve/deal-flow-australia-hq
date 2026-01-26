/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatDateWithTime,
  formatRelativeTime,
  formatDayAndMonth,
  formatCommentDate,
  formatMilestoneDate,
  formatParticipantDate,
  formatProfileDate,
} from '../dateUtils';

describe('dateUtils', () => {
  // Use a fixed date for consistent testing
  const fixedDate = new Date('2024-06-15T10:30:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    it('should format a valid date string', () => {
      const result = formatDate('2024-01-15T00:00:00Z');
      expect(result).toMatch(/Jan 15, 2024|15 Jan 2024/);
    });

    it('should format a Date object', () => {
      const result = formatDate(new Date('2024-03-20'));
      expect(result).toContain('2024');
      expect(result).toContain('Mar');
    });

    it('should return "Not specified" for null', () => {
      expect(formatDate(null)).toBe('Not specified');
    });

    it('should return "Not specified" for undefined', () => {
      expect(formatDate(undefined)).toBe('Not specified');
    });

    it('should return "Invalid date" for invalid date string', () => {
      expect(formatDate('not-a-date')).toBe('Invalid date');
    });

    it('should handle empty string', () => {
      expect(formatDate('')).toBe('Not specified');
    });
  });

  describe('formatDateWithTime', () => {
    it('should include time in the formatted output', () => {
      const result = formatDateWithTime('2024-06-15T14:30:00Z');
      expect(result).toContain('2024');
      expect(result).toContain('Jun');
    });

    it('should return "Not specified" for null', () => {
      expect(formatDateWithTime(null)).toBe('Not specified');
    });

    it('should return "Invalid date" for invalid input', () => {
      expect(formatDateWithTime('invalid')).toBe('Invalid date');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "Just now" for very recent times', () => {
      const justNow = new Date(fixedDate.getTime() - 30000); // 30 seconds ago
      expect(formatRelativeTime(justNow)).toBe('Just now');
    });

    it('should return minutes ago for recent times', () => {
      const minutesAgo = new Date(fixedDate.getTime() - 5 * 60 * 1000); // 5 minutes ago
      expect(formatRelativeTime(minutesAgo)).toBe('5 minutes ago');
    });

    it('should return singular "minute" for 1 minute', () => {
      const oneMinuteAgo = new Date(fixedDate.getTime() - 60 * 1000);
      expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
    });

    it('should return hours ago', () => {
      const hoursAgo = new Date(fixedDate.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
      expect(formatRelativeTime(hoursAgo)).toBe('3 hours ago');
    });

    it('should return singular "hour" for 1 hour', () => {
      const oneHourAgo = new Date(fixedDate.getTime() - 60 * 60 * 1000);
      expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
    });

    it('should return days ago', () => {
      const daysAgo = new Date(fixedDate.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      expect(formatRelativeTime(daysAgo)).toBe('5 days ago');
    });

    it('should return singular "day" for 1 day', () => {
      const oneDayAgo = new Date(fixedDate.getTime() - 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');
    });

    it('should return formatted date for dates older than 30 days', () => {
      const oldDate = new Date(fixedDate.getTime() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
      const result = formatRelativeTime(oldDate);
      expect(result).toContain('2024'); // Should be a formatted date, not relative
    });

    it('should return "Not specified" for null', () => {
      expect(formatRelativeTime(null)).toBe('Not specified');
    });

    it('should return "Invalid date" for invalid input', () => {
      expect(formatRelativeTime('invalid')).toBe('Invalid date');
    });
  });

  describe('formatDayAndMonth', () => {
    it('should format with weekday and month', () => {
      const result = formatDayAndMonth('2024-06-15');
      expect(result).toContain('June');
      expect(result).toContain('15');
      expect(result).toMatch(/Saturday|Friday/); // Depends on timezone
    });

    it('should return "Today" for null', () => {
      expect(formatDayAndMonth(null)).toBe('Today');
    });

    it('should return "Today" for invalid date', () => {
      expect(formatDayAndMonth('invalid')).toBe('Today');
    });
  });

  describe('formatCommentDate', () => {
    it('should format comment date with full timestamp', () => {
      const result = formatCommentDate('2024-06-15T14:30:00Z');
      expect(result).toContain('2024');
      expect(result).toContain('Jun');
    });
  });

  describe('formatMilestoneDate', () => {
    it('should format milestone date', () => {
      const result = formatMilestoneDate('2024-06-15');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should handle Date object', () => {
      const result = formatMilestoneDate(new Date('2024-06-15'));
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should return empty string for undefined', () => {
      expect(formatMilestoneDate(undefined)).toBe('');
    });
  });

  describe('formatParticipantDate', () => {
    it('should format in Australian format', () => {
      const result = formatParticipantDate('2024-06-15');
      expect(result).toContain('2024');
    });
  });

  describe('formatProfileDate', () => {
    it('should format in US format with full month', () => {
      const result = formatProfileDate('2024-06-15');
      expect(result).toContain('2024');
      expect(result).toContain('June');
    });
  });
});
