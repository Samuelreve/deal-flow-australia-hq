
/// <reference types="vitest" />
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { describe, it, expect } from 'vitest';
import { useAllowedDealStatuses } from '../useAllowedDealStatuses';

describe('useAllowedDealStatuses', () => {
  it('should return allowed deal statuses', async () => {
    const { result } = renderHook(() => useAllowedDealStatuses());
    
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
  });
});
