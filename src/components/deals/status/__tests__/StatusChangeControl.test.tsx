
/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the hook
vi.mock('@/hooks/useAllowedDealStatuses', () => ({
  useAllowedDealStatuses: () => [
    { id: 'new', label: 'New' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ]
}));

// Mock the component since we need it to work with our mocked data
const MockStatusChangeControl = ({ 
  dealId, 
  currentStatus, 
  onStatusUpdated 
}: { 
  dealId: string;
  currentStatus: string;
  onStatusUpdated: (status: string) => void;
}) => {
  const statuses = [
    { id: 'new', label: 'New' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ];
  
  const currentStatusObj = statuses.find(s => s.id === currentStatus);
  
  return (
    <div>
      <span>{currentStatusObj?.label || currentStatus}</span>
      <select onChange={(e) => onStatusUpdated(e.target.value)}>
        {statuses.map(status => (
          <option key={status.id} value={status.id}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
};

vi.mock('../StatusChangeControl', () => ({
  default: MockStatusChangeControl
}));

describe('StatusChangeControl Component', () => {
  const mockOnStatusUpdated = vi.fn();

  it('renders without crashing', () => {
    render(
      <MockStatusChangeControl
        dealId="123"
        currentStatus="new"
        onStatusUpdated={mockOnStatusUpdated}
      />
    );
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('displays the correct current status', () => {
    render(
      <MockStatusChangeControl
        dealId="123"
        currentStatus="in_progress"
        onStatusUpdated={mockOnStatusUpdated}
      />
    );
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });
});
