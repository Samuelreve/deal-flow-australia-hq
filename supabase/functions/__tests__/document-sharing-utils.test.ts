
import { describe, it, expect } from 'vitest';
import { isValidEmail, validateShareLinkOptions } from '../_shared/document-sharing/validation.ts';
import { generateToken } from '../_shared/document-sharing/token.ts';

describe('Document sharing utilities', () => {
  describe('Email validation', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(isValidEmail('user-name@domain.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('plaintext')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user@domain.')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('Share link options validation', () => {
    it('should validate correct share options', () => {
      const result = validateShareLinkOptions({
        can_download: true,
        recipients: ['test@example.com'],
        expires_at: new Date(Date.now() + 86400000).toISOString() // 1 day in future
      });
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should require can_download field', () => {
      const result = validateShareLinkOptions({
        recipients: ['test@example.com'],
        expires_at: new Date(Date.now() + 86400000).toISOString()
      } as any);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Missing required field: can_download');
    });

    it('should validate recipient emails', () => {
      const result = validateShareLinkOptions({
        can_download: true,
        recipients: ['valid@example.com', 'invalid-email', 'another@invalid']
      });
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid email addresses');
      expect(result.error).toContain('invalid-email');
      expect(result.error).toContain('another@invalid');
    });

    it('should validate expiry date is in future', () => {
      const result = validateShareLinkOptions({
        can_download: true,
        expires_at: new Date(Date.now() - 86400000).toISOString() // 1 day in past
      });
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Expiry date must be in the future');
    });

    it('should validate expiry date format', () => {
      const result = validateShareLinkOptions({
        can_download: true,
        expires_at: 'not-a-date'
      });
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid date format');
    });
  });

  describe('Token generation', () => {
    it('should generate a token with the correct format', () => {
      // Mock crypto.getRandomValues
      const originalCrypto = globalThis.crypto;
      
      globalThis.crypto = {
        ...originalCrypto,
        getRandomValues: (arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = i % 256;
          }
          return arr;
        }
      };
      
      const token = generateToken();
      
      // Restore original crypto
      globalThis.crypto = originalCrypto;
      
      // Token should be 48 characters (24 bytes as hex)
      expect(token.length).toBe(48);
      // Token should only contain hex characters
      expect(token).toMatch(/^[0-9a-f]+$/);
    });
  });
});
