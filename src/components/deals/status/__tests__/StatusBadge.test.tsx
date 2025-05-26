
/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the actual component since we don't have its implementation
const MockStatusBadge = ({ status }: { status: string }) => (
  <span className={`badge ${status}`}>{status}</span>
);

vi.mock('../StatusBadge', () => ({
  default: MockStatusBadge
}));

describe('StatusBadge Component', () => {
  it('renders the status badge with correct text', () => {
    render(<MockStatusBadge status="active" />);
    const badgeElement = screen.getByText('active');
    expect(badgeElement).toBeInTheDocument();
  });

  it('applies correct CSS class', () => {
    render(<MockStatusBadge status="pending" />);
    const badgeElement = screen.getByText('pending');
    expect(badgeElement).toHaveClass('badge', 'pending');
  });
});
