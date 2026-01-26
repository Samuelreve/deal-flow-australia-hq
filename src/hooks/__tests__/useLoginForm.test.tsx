/// <reference types="vitest" />
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useLoginForm } from '../useLoginForm';

// Mock dependencies
const mockLogin = vi.fn();
const mockToast = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    loading: false,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/login', state: null }),
  };
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('useLoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useLoginForm(), { wrapper });

      expect(result.current.errorMsg).toBe('');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.showSuccess).toBe(false);
      expect(result.current.showResetPassword).toBe(false);
      expect(result.current.needs2fa).toBe(false);
      expect(result.current.challengeId).toBeNull();
    });

    it('should have form with default values', () => {
      const { result } = renderHook(() => useLoginForm(), { wrapper });

      expect(result.current.form.getValues()).toEqual({
        email: '',
        password: '',
      });
    });
  });

  describe('handleLoginSubmit', () => {
    it('should call login with correct credentials', async () => {
      mockLogin.mockResolvedValue(true);

      const { result } = renderHook(() => useLoginForm(), { wrapper });

      await act(async () => {
        await result.current.handleLoginSubmit('test@example.com', 'password123');
      });

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should set showSuccess on successful login', async () => {
      mockLogin.mockResolvedValue(true);

      const { result } = renderHook(() => useLoginForm(), { wrapper });

      await act(async () => {
        await result.current.handleLoginSubmit('test@example.com', 'password123');
      });

      expect(result.current.showSuccess).toBe(true);
    });

    it('should show success toast on successful login', async () => {
      mockLogin.mockResolvedValue(true);

      const { result } = renderHook(() => useLoginForm(), { wrapper });

      await act(async () => {
        await result.current.handleLoginSubmit('test@example.com', 'password123');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    });

    it('should return true on successful login', async () => {
      mockLogin.mockResolvedValue(true);

      const { result } = renderHook(() => useLoginForm(), { wrapper });

      let loginResult: boolean = false;
      await act(async () => {
        loginResult = await result.current.handleLoginSubmit('test@example.com', 'password123');
      });

      expect(loginResult).toBe(true);
    });

    it('should set error message on failed login', async () => {
      mockLogin.mockResolvedValue(false);

      const { result } = renderHook(() => useLoginForm(), { wrapper });

      await act(async () => {
        await result.current.handleLoginSubmit('test@example.com', 'wrongpassword');
      });

      expect(result.current.errorMsg).toContain('Invalid email or password');
    });

    it('should show error toast on failed login', async () => {
      mockLogin.mockResolvedValue(false);

      const { result } = renderHook(() => useLoginForm(), { wrapper });

      await act(async () => {
        await result.current.handleLoginSubmit('test@example.com', 'wrongpassword');
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          title: 'Sign in failed',
        })
      );
    });

    it('should handle invalid credentials error', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid login credentials'));

      const { result } = renderHook(() => useLoginForm(), { wrapper });

      await act(async () => {
        await result.current.handleLoginSubmit('test@example.com', 'wrongpassword');
      });

      expect(result.current.errorMsg).toContain('Invalid email or password');
    });

    it('should handle email not confirmed error', async () => {
      mockLogin.mockRejectedValue(new Error('Email not confirmed'));

      const { result } = renderHook(() => useLoginForm(), { wrapper });

      await act(async () => {
        await result.current.handleLoginSubmit('test@example.com', 'password');
      });

      expect(result.current.errorMsg).toContain('confirm your account');
    });

    it('should handle rate limiting error', async () => {
      mockLogin.mockRejectedValue(new Error('Too many requests'));

      const { result } = renderHook(() => useLoginForm(), { wrapper });

      await act(async () => {
        await result.current.handleLoginSubmit('test@example.com', 'password');
      });

      expect(result.current.errorMsg).toContain('Too many login attempts');
    });

    it('should be false after login completes', async () => {
      mockLogin.mockResolvedValue(true);

      const { result } = renderHook(() => useLoginForm(), { wrapper });

      await act(async () => {
        await result.current.handleLoginSubmit('test@example.com', 'password');
      });

      // Loading should be false after completion
      expect(result.current.isLoading).toBe(false);
    });
  });
});
