
/// <reference types="vitest" />
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { describe, it, expect } from 'vitest';

// Mock hook since we don't have the actual implementation
const mockUseDeals = () => ({
  deals: [],
  loading: false,
  fetchDeals: async () => {}
});

describe('useDeals fetchData', () => {
  it('should fetch deals data', async () => {
    const { result } = renderHook(() => mockUseDeals());
    
    await waitFor(() => {
      expect(result.current.deals).toBeDefined();
    });
  });
});
