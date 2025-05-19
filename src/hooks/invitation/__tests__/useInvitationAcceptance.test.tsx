
import { renderHook, act } from '@testing-library/react';
import { useInvitationAcceptance } from '../useInvitationAcceptance';
import { invitationService } from '@/services/invitationService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/services/invitationService');
vi.mock('@/contexts/AuthContext');
vi.mock('react-router-dom');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

describe('useInvitationAcceptance', () => {
  // Setup mocks before each test
  beforeEach(() => {
    // Mock navigation
    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
    
    // Default auth mock
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: 'test-user-id' },
      session: { access_token: 'test-token' },
      loading: false
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle authentication loading state', () => {
    // Override auth mock for this test
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      session: null,
      loading: true
    });
    
    const { result } = renderHook(() => useInvitationAcceptance('test-token'));
    
    expect(result.current.acceptanceStatus).toBe('loading');
    expect(result.current.statusMessage).toBe('Loading authentication state...');
  });

  it('should handle missing token', () => {
    const { result } = renderHook(() => useInvitationAcceptance(null));
    
    expect(result.current.acceptanceStatus).toBe('error');
    expect(result.current.statusMessage).toBe('Invalid invitation link: Token is missing.');
  });

  it('should prompt unauthenticated user to log in', () => {
    // Override auth mock for this test
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      session: null,
      loading: false
    });
    
    const { result } = renderHook(() => useInvitationAcceptance('test-token'));
    
    expect(result.current.acceptanceStatus).toBe('idle');
    expect(result.current.statusMessage).toBe('Please log in or sign up to accept this invitation.');
  });

  it('should handle successful invitation acceptance', async () => {
    // Mock successful API response
    (invitationService.acceptInvitation as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      success: true,
      data: {
        message: 'Invitation accepted successfully',
        dealId: 'test-deal-id'
      }
    });
    
    const { result, rerender } = renderHook(() => useInvitationAcceptance('test-token'));
    
    // Wait for async operations
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    rerender();
    
    expect(result.current.acceptanceStatus).toBe('success');
    expect(result.current.statusMessage).toBe('Invitation accepted successfully');
    expect(result.current.acceptedDealId).toBe('test-deal-id');
  });

  it('should handle invitation acceptance errors', async () => {
    // Mock API error
    (invitationService.acceptInvitation as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      success: false,
      error: 'Invitation not found'
    });
    
    const { result, rerender } = renderHook(() => useInvitationAcceptance('test-token'));
    
    // Wait for async operations
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    rerender();
    
    expect(result.current.acceptanceStatus).toBe('error');
    expect(result.current.statusMessage).toBe('Failed to accept invitation: Invitation not found');
  });
});
