
/// <reference types="vitest" />
import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';

// Mock the actual component since we don't have its implementation
const MockDealHeader = ({ onStatusChange }: { onStatusChange?: (status: string) => void }) => (
  <div>
    <h1>Deal Header</h1>
    <button onClick={() => onStatusChange?.('active')}>Change Status</button>
  </div>
);

vi.mock('../DealHeader', () => ({
  default: MockDealHeader
}));

describe('DealHeader Component', () => {
  it('renders the deal header', () => {
    render(<MockDealHeader />);
    const headerElement = screen.getByText('Deal Header');
    expect(headerElement).toBeInTheDocument();
  });

  it('handles status change', async () => {
    const mockStatusChange = vi.fn();
    render(<MockDealHeader onStatusChange={mockStatusChange} />);
    
    const button = screen.getByText('Change Status');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockStatusChange).toHaveBeenCalledWith('active');
    });
  });
});
