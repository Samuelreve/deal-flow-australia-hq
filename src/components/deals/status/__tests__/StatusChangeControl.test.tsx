
/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatusChangeControl from '../StatusChangeControl';

// Mock the hook
vi.mock('@/hooks/useAllowedDealStatuses', () => ({
  useAllowedDealStatuses: () => [
    { id: 'new', label: 'New' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ]
}));

describe('StatusChangeControl Component', () => {
  const mockStatuses = [
    { id: 'new', label: 'New' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ];

  const mockOnStatusUpdated = vi.fn();

  it('renders without crashing', () => {
    render(
      <StatusChangeControl
        dealId="123"
        currentStatus="new"
        onStatusUpdated={mockOnStatusUpdated}
      />
    );
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('displays the correct current status', () => {
    render(
      <StatusChangeControl
        dealId="123"
        currentStatus="in_progress"
        onStatusUpdated={mockOnStatusUpdated}
      />
    );
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });
});
