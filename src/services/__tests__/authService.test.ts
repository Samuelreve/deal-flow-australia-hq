/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client - define mock BEFORE vi.mock
vi.mock('@/integrations/supabase/client', () => {
  const mockSupabase = {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
    from: vi.fn(),
  };
  return { supabase: mockSupabase };
});

// Import after mock
import { authService } from '../authService';
import { supabase } from '@/integrations/supabase/client';

// Get the mocked supabase for assertions
const mockSupabase = vi.mocked(supabase);

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });
  });

  describe('login', () => {
    it('should call signInWithPassword with correct credentials', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token-123' };
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await authService.login('test@example.com', 'password123');

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
    });

    it('should throw error on login failure', async () => {
      const mockError = new Error('Invalid credentials');
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('signup', () => {
    it('should call signUp with correct data', async () => {
      const mockUser = { id: 'user-123', email: 'new@example.com' };
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await authService.signup('new@example.com', 'password123', 'John Doe');

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost:3000/',
          data: {
            name: 'John Doe',
          },
        },
      });
      expect(result.user).toEqual(mockUser);
    });

    it('should use email prefix as name when name not provided', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'user-123' }, session: null },
        error: null,
      });

      await authService.signup('john.doe@example.com', 'password123');

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            data: { name: 'john.doe' },
          }),
        })
      );
    });

    it('should throw error on signup failure', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: new Error('Email already exists'),
      });

      await expect(authService.signup('existing@example.com', 'password123')).rejects.toThrow(
        'Email already exists'
      );
    });
  });

  describe('logout', () => {
    it('should call signOut', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      await authService.logout();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw error on logout failure', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: new Error('Logout failed'),
      });

      await expect(authService.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('signInWithGoogle', () => {
    it('should call signInWithOAuth with google provider', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth' },
        error: null,
      });

      const result = await authService.signInWithGoogle();

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/dashboard',
        },
      });
      expect(result.url).toBe('https://accounts.google.com/oauth');
    });

    it('should throw error on OAuth failure', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: new Error('OAuth failed'),
      });

      await expect(authService.signInWithGoogle()).rejects.toThrow('OAuth failed');
    });
  });

  describe('signInWithApple', () => {
    it('should call signInWithOAuth with apple provider', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://appleid.apple.com/auth' },
        error: null,
      });

      const result = await authService.signInWithApple();

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'apple',
        options: {
          redirectTo: 'http://localhost:3000/dashboard',
        },
      });
      expect(result.url).toBe('https://appleid.apple.com/auth');
    });
  });

  describe('updateProfile', () => {
    it('should update profile with correct data', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Updated Name',
        role: 'seller' as const,
        company: 'New Company',
        phone: '+1234567890',
        is_professional: true,
        professional_headline: 'Expert Advisor',
        professional_bio: 'Bio text',
        professional_firm_name: 'Firm Name',
        professional_contact_email: 'contact@firm.com',
        professional_phone: '+0987654321',
        professional_website: 'https://firm.com',
        professional_location: 'Sydney, Australia',
        professional_specializations: ['M&A', 'Due Diligence'],
        onboarding_complete: true,
      };

      const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await authService.updateProfile(mockProfile);

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Name',
          company: 'New Company',
          is_professional: true,
        })
      );
      expect(result).toEqual(mockProfile);
    });

    it('should handle specializations as array', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'seller' as const,
        professional_specializations: ['Spec 1', 'Spec 2'],
      };

      const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockProfile, professional_specializations: ['Spec 1', 'Spec 2'] },
          error: null,
        }),
      };
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await authService.updateProfile(mockProfile);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          professional_specializations: ['Spec 1', 'Spec 2'],
        })
      );
      expect(result?.professional_specializations).toEqual(['Spec 1', 'Spec 2']);
    });

    it('should throw error on update failure', async () => {
      const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Update failed'),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      await expect(
        authService.updateProfile({
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test',
          role: 'seller',
        })
      ).rejects.toThrow('Update failed');
    });
  });
});
