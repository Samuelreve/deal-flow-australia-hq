
import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useAllowedDealStatuses } from '../useAllowedDealStatuses';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn()
  }
}));

describe('useAllowedDealStatuses Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns allowed statuses from successful API response', async () => {
    // Mock successful API response
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: {
        current_status: 'active',
        allowed_statuses: ['pending', 'completed', 'cancelled'],
        participant_role: 'seller'
      },
      error: null
    });

    const { result } = renderHook(() => useAllowedDealStatuses('123'));

    // Initially, it should be loading with empty array
    expect(result.current.isLoading).toBe(true);
    expect(result.current.allowedStatuses).toEqual([]);

    // Wait for the hook to process the API response
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have the correct allowed statuses
    expect(result.current.allowedStatuses).toEqual(['pending', 'completed', 'cancelled']);
    expect(result.current.error).toBeNull();
    
    // Verify the API was called correctly
    expect(supabase.rpc).toHaveBeenCalledWith('get_allowed_deal_statuses', {
      p_deal_id: '123'
    });
  });

  test('handles API error', async () => {
    // Mock API error
    const errorMsg = 'Failed to fetch allowed statuses';
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: {
        message: errorMsg,
        details: '',
        hint: '',
        code: ''
      }
    });

    const { result } = renderHook(() => useAllowedDealStatuses('123'));

    // Wait for the hook to process the API response
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have error state
    expect(result.current.allowedStatuses).toEqual([]);
    expect(result.current.error).toBe(errorMsg);
  });

  test('handles unexpected response format', async () => {
    // Mock unexpected response format
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: "Not the expected object format",
      error: null
    });

    const { result } = renderHook(() => useAllowedDealStatuses('123'));

    // Wait for the hook to process the API response
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should default to empty array for allowed statuses
    expect(result.current.allowedStatuses).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  test('does not make API call with empty deal ID', () => {
    renderHook(() => useAllowedDealStatuses(''));
    
    // API should not be called when deal ID is empty
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
