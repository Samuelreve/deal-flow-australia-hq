/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { fileSize, formatBytes } from '../formatBytes';

describe('fileSize / formatBytes', () => {
  describe('basic conversions', () => {
    it('should return "0 Bytes" for 0', () => {
      expect(fileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      expect(fileSize(500)).toBe('500 Bytes');
      expect(fileSize(1)).toBe('1 Bytes');
    });

    it('should format KB correctly', () => {
      expect(fileSize(1024)).toBe('1 KB');
      expect(fileSize(1536)).toBe('1.5 KB');
      expect(fileSize(2048)).toBe('2 KB');
    });

    it('should format MB correctly', () => {
      expect(fileSize(1048576)).toBe('1 MB');
      expect(fileSize(1572864)).toBe('1.5 MB');
      expect(fileSize(10485760)).toBe('10 MB');
    });

    it('should format GB correctly', () => {
      expect(fileSize(1073741824)).toBe('1 GB');
      expect(fileSize(2147483648)).toBe('2 GB');
    });

    it('should format TB correctly', () => {
      expect(fileSize(1099511627776)).toBe('1 TB');
    });

    it('should format PB correctly', () => {
      expect(fileSize(1125899906842624)).toBe('1 PB');
    });
  });

  describe('decimal places', () => {
    it('should respect decimal places parameter', () => {
      expect(fileSize(1536, 0)).toBe('2 KB');
      expect(fileSize(1536, 1)).toBe('1.5 KB');
      expect(fileSize(1536, 2)).toBe('1.5 KB');
      expect(fileSize(1536, 3)).toBe('1.5 KB');
    });

    it('should show more precision when needed', () => {
      expect(fileSize(1234567, 0)).toBe('1 MB');
      expect(fileSize(1234567, 1)).toBe('1.2 MB');
      expect(fileSize(1234567, 2)).toBe('1.18 MB');
      expect(fileSize(1234567, 3)).toBe('1.177 MB');
    });
  });

  describe('formatBytes alias', () => {
    it('should be an alias for fileSize', () => {
      expect(formatBytes).toBe(fileSize);
      expect(formatBytes(1024)).toBe(fileSize(1024));
      expect(formatBytes(0)).toBe(fileSize(0));
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      const result = fileSize(1125899906842624000);
      expect(result).toContain('PB');
    });

    it('should handle fractional bytes (rounding)', () => {
      expect(fileSize(1023)).toBe('1023 Bytes');
      expect(fileSize(1025)).toBe('1 KB');
    });
  });
});
