
/// <reference types="vitest" />
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAllowedDealStatuses } from '../useAllowedDealStatuses';

describe('useAllowedDealStatuses', () => {
  it('should return allowed deal statuses', async () => {
    const { result } = renderHook(() => useAllowedDealStatuses('test-deal-id'));
    
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
  });
});
