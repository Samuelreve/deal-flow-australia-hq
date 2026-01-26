/// <reference types="vitest" />
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { useDeals } from '../useDeals';
import { dealsService, Deal } from '@/services/dealsService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the dealsService
vi.mock('@/services/dealsService', () => ({
  dealsService: {
    getDeals: vi.fn(),
    createDeal: vi.fn(),
    deleteDeal: vi.fn(),
  },
}));

// Mock auth context
const mockAuth = {
  isAuthenticated: true,
};
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

const mockDeals: Deal[] = [
  {
    id: 'deal-1',
    title: 'Active Deal 1',
    status: 'active',
    health_score: 80,
    seller_id: 'seller-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'deal-2',
    title: 'Completed Deal',
    status: 'completed',
    health_score: 100,
    seller_id: 'seller-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'deal-3',
    title: 'Draft Deal',
    status: 'draft',
    health_score: 50,
    seller_id: 'seller-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
];

// Wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDeals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.isAuthenticated = true;
  });

  describe('initial state', () => {
    it('should start with loading true', () => {
      vi.mocked(dealsService.getDeals).mockResolvedValue({ deals: [], totalCount: 0 });

      const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

      expect(result.current.loading).toBe(true);
    });

    it('should start with empty deals array', () => {
      vi.mocked(dealsService.getDeals).mockResolvedValue({ deals: [], totalCount: 0 });

      const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

      expect(result.current.deals).toEqual([]);
    });
  });

  describe('fetching deals', () => {
    it('should fetch deals when authenticated', async () => {
      vi.mocked(dealsService.getDeals).mockResolvedValue({
        deals: mockDeals,
        totalCount: 3,
      });

      const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(dealsService.getDeals).toHaveBeenCalled();
      expect(result.current.deals).toEqual(mockDeals);
      expect(result.current.totalCount).toBe(3);
    });

    it('should not fetch deals when not authenticated', async () => {
      mockAuth.isAuthenticated = false;
      vi.mocked(dealsService.getDeals).mockResolvedValue({ deals: [], totalCount: 0 });

      renderHook(() => useDeals(), { wrapper: createWrapper() });

      // Wait a bit to ensure effect has run
      await new Promise((r) => setTimeout(r, 100));

      expect(dealsService.getDeals).not.toHaveBeenCalled();
    });

    it('should handle fetch error', async () => {
      vi.mocked(dealsService.getDeals).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load deals');
      expect(result.current.deals).toEqual([]);
    });

    it('should pass pagination options', async () => {
      vi.mocked(dealsService.getDeals).mockResolvedValue({ deals: mockDeals, totalCount: 10 });

      renderHook(() => useDeals({ page: 2, limit: 5 }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(dealsService.getDeals).toHaveBeenCalledWith({ page: 2, limit: 5 });
      });
    });
  });

  describe('metrics', () => {
    it('should calculate correct metrics', async () => {
      vi.mocked(dealsService.getDeals).mockResolvedValue({
        deals: mockDeals,
        totalCount: 3,
      });

      const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.metrics.total).toBe(3);
      expect(result.current.metrics.active).toBe(1);
      expect(result.current.metrics.completed).toBe(1);
      expect(result.current.metrics.draft).toBe(1);
      expect(result.current.metrics.averageHealthScore).toBe(77); // (80+100+50)/3 = 76.67 rounded
    });

    it('should return 0 average health score for empty deals', async () => {
      vi.mocked(dealsService.getDeals).mockResolvedValue({ deals: [], totalCount: 0 });

      const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.metrics.averageHealthScore).toBe(0);
    });
  });

  describe('createDeal', () => {
    it('should create deal and update state', async () => {
      const newDeal: Deal = {
        id: 'new-deal',
        title: 'New Deal',
        status: 'draft',
        health_score: 0,
        seller_id: 'seller-1',
        created_at: '2024-01-20T00:00:00Z',
        updated_at: '2024-01-20T00:00:00Z',
      };

      vi.mocked(dealsService.getDeals).mockResolvedValue({ deals: mockDeals, totalCount: 3 });
      vi.mocked(dealsService.createDeal).mockResolvedValue(newDeal);

      const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        const created = await result.current.createDeal({ title: 'New Deal' });
        expect(created).toEqual(newDeal);
      });

      expect(dealsService.createDeal).toHaveBeenCalledWith({ title: 'New Deal' });
      expect(result.current.deals[0]).toEqual(newDeal);
      expect(result.current.totalCount).toBe(4);
    });

    it('should throw error on create failure', async () => {
      vi.mocked(dealsService.getDeals).mockResolvedValue({ deals: [], totalCount: 0 });
      vi.mocked(dealsService.createDeal).mockRejectedValue(new Error('Create failed'));

      const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.createDeal({ title: 'Test' })).rejects.toThrow('Create failed');
    });
  });

  describe('deleteDeal', () => {
    it('should delete deal and refresh', async () => {
      vi.mocked(dealsService.getDeals).mockResolvedValue({ deals: mockDeals, totalCount: 3 });
      vi.mocked(dealsService.deleteDeal).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteDeal('deal-1');
      });

      expect(dealsService.deleteDeal).toHaveBeenCalledWith('deal-1');
      // Should refetch deals
      expect(dealsService.getDeals).toHaveBeenCalledTimes(2);
    });

    it('should throw error on delete failure', async () => {
      vi.mocked(dealsService.getDeals).mockResolvedValue({ deals: mockDeals, totalCount: 3 });
      vi.mocked(dealsService.deleteDeal).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.deleteDeal('deal-1')).rejects.toThrow('Delete failed');
    });
  });

  describe('refreshDeals', () => {
    it('should refetch deals', async () => {
      vi.mocked(dealsService.getDeals).mockResolvedValue({ deals: mockDeals, totalCount: 3 });

      const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(dealsService.getDeals).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.refreshDeals();
      });

      expect(dealsService.getDeals).toHaveBeenCalledTimes(2);
    });
  });
});
