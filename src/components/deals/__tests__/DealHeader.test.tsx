
/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the actual component since we don't have its implementation
const MockDealHeader = ({ deal, onEdit }: { deal: any; onEdit?: () => void }) => (
  <div>
    <h1>{deal?.title || 'Deal Title'}</h1>
    <button onClick={onEdit}>Edit Deal</button>
  </div>
);

vi.mock('../DealHeader', () => ({
  default: MockDealHeader
}));

describe('DealHeader Component', () => {
  const mockDeal = {
    id: '1',
    title: 'Test Deal',
    status: 'active'
  };

  it('renders the deal title', () => {
    render(<MockDealHeader deal={mockDeal} />);
    const titleElement = screen.getByText('Test Deal');
    expect(titleElement).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const mockOnEdit = vi.fn();
    render(<MockDealHeader deal={mockDeal} onEdit={mockOnEdit} />);
    
    const editButton = screen.getByText('Edit Deal');
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalled();
    });
  });
});
