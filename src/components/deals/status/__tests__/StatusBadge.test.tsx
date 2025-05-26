
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge Component', () => {
  test('renders draft status correctly', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });
  
  test('renders active status correctly', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
  
  test('renders pending status correctly', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
  
  test('renders completed status correctly', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
  
  test('renders cancelled status correctly', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });
  
  test('applies custom class names', () => {
    const { container } = render(<StatusBadge status="active" className="test-class" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('test-class');
  });
});
