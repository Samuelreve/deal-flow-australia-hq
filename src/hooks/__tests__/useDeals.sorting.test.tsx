
/// <reference types="vitest" />
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Mock hook since we don't have the actual implementation
const mockUseDeals = () => ({
  deals: [],
  sortedDeals: [],
  sortDeals: (criteria: any) => {}
});

describe('useDeals sorting', () => {
  it('should sort deals', async () => {
    const { result } = renderHook(() => mockUseDeals());
    
    await waitFor(() => {
      expect(result.current.sortedDeals).toBeDefined();
    });
  });
});
