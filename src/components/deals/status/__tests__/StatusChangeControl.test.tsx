import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StatusChangeControl from '../StatusChangeControl';

describe('StatusChangeControl Component', () => {
  const mockStatuses = [
    { id: 'new', label: 'New' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ];

  const mockOnChange = jest.fn();

  it('renders without crashing', () => {
    render(
      <StatusChangeControl
        currentStatus="new"
        statuses={mockStatuses}
        onChange={mockOnChange}
      />
    );
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('displays the correct current status', () => {
    render(
      <StatusChangeControl
        currentStatus="in_progress"
        statuses={mockStatuses}
        onChange={mockOnChange}
      />
    );
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('calls onChange when a new status is selected', async () => {
    render(
      <StatusChangeControl
        currentStatus="new"
        statuses={mockStatuses}
        onChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'New' }));
    fireEvent.click(screen.getByText('In Progress'));

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('in_progress');
    });
  });

  it('does not call onChange if the same status is selected', () => {
    render(
      <StatusChangeControl
        currentStatus="new"
        statuses={mockStatuses}
        onChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'New' }));
    fireEvent.click(screen.getByText('New'));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('renders status options correctly', () => {
    render(
      <StatusChangeControl
        currentStatus="new"
        statuses={mockStatuses}
        onChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'New' }));
    mockStatuses.forEach(status => {
      expect(screen.getByText(status.label)).toBeInTheDocument();
    });
  });
});
