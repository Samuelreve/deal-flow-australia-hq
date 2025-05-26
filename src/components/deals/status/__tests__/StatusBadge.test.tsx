
/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge Component', () => {
  it('renders with draft status', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toHaveClass('bg-gray-200');
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

  it('renders with pending status', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toHaveClass('bg-amber-100');
  });

  it('handles unknown status gracefully', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toHaveClass('bg-gray-200');
  });
});
