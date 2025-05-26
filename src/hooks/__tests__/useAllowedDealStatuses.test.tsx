import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useAllowedDealStatuses } from '../useAllowedDealStatuses';

describe('useAllowedDealStatuses', () => {
  it('should return allowed deal statuses based on user role', async () => {
    const { result } = renderHook(() => useAllowedDealStatuses('admin'));

    await waitFor(() => {
      expect(result.current).toEqual([
        { label: 'Draft', value: 'draft' },
        { label: 'Negotiating', value: 'negotiating' },
        { label: 'Review', value: 'review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Closed', value: 'closed' },
        { label: 'Lost', value: 'lost' },
        { label: 'Abandoned', value: 'abandoned' },
      ]);
    });
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useAllowedDealStatuses('admin'));
    expect(result.current).toBeDefined();
  });
});
