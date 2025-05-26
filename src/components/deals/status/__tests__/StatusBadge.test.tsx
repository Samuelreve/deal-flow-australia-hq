
/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge Component', () => {
  it('renders with draft status', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toHaveClass('bg-gray-100');
  });

  it('renders with active status', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Active')).toHaveClass('bg-blue-100');
  });

  it('renders with completed status', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toHaveClass('bg-green-100');
  });

  it('renders with cancelled status', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toHaveClass('bg-red-100');
  });

  it('renders with negotiating status', () => {
    render(<StatusBadge status="negotiating" />);
    expect(screen.getByText('Negotiating')).toBeInTheDocument();
    expect(screen.getByText('Negotiating')).toHaveClass('bg-yellow-100');
  });

  it('renders with review status', () => {
    render(<StatusBadge status="review" />);
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Review')).toHaveClass('bg-purple-100');
  });

  it('renders with approved status', () => {
    render(<StatusBadge status="approved" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toHaveClass('bg-emerald-100');
  });

  it('renders with closed status', () => {
    render(<StatusBadge status="closed" />);
    expect(screen.getByText('Closed')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toHaveClass('bg-slate-100');
  });

  it('renders with lost status', () => {
    render(<StatusBadge status="lost" />);
    expect(screen.getByText('Lost')).toBeInTheDocument();
    expect(screen.getByText('Lost')).toHaveClass('bg-orange-100');
  });

  it('renders with abandoned status', () => {
    render(<StatusBadge status="abandoned" />);
    expect(screen.getByText('Abandoned')).toBeInTheDocument();
    expect(screen.getByText('Abandoned')).toHaveClass('bg-gray-100');
  });

  it('handles unknown status gracefully', () => {
    render(<StatusBadge status="unknown" as any />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toHaveClass('bg-gray-100');
  });
});
