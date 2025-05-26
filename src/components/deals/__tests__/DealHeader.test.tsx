import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DealHeader from '../DealHeader';

describe('DealHeader Component', () => {
  const mockDeal = {
    id: '123',
    title: 'Test Deal',
    description: 'A test deal',
    status: 'active',
    health_score: 75,
    created_at: '2024-05-03T12:00:00.000Z',
    user_id: 'user123',
  };

  it('renders deal information correctly', () => {
    render(<DealHeader deal={mockDeal} />);
    expect(screen.getByText('Test Deal')).toBeInTheDocument();
    expect(screen.getByText('A test deal')).toBeInTheDocument();
  });

  it('opens and closes the edit modal', async () => {
    render(<DealHeader deal={mockDeal} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Update Deal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(screen.queryByText('Update Deal')).not.toBeInTheDocument();
    });
  });

  it('submits the form with updated data', async () => {
    const onUpdate = jest.fn();
    render(<DealHeader deal={mockDeal} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Deal' } });
    fireEvent.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it('displays an error message if update fails', async () => {
    const onUpdate = jest.fn(() => Promise.reject('Update failed'));
    render(<DealHeader deal={mockDeal} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });
});
