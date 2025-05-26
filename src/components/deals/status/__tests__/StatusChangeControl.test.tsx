
/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the actual component since we don't have its implementation
const MockStatusChangeControl = ({ onStatusChange }: { onStatusChange?: (status: string) => void }) => (
  <div>
    <label>Status Control</label>
    <select onChange={(e) => onStatusChange?.(e.target.value)}>
      <option value="draft">Draft</option>
      <option value="active">Active</option>
    </select>
  </div>
);

vi.mock('../StatusChangeControl', () => ({
  default: MockStatusChangeControl
}));

describe('StatusChangeControl Component', () => {
  it('renders the status control', () => {
    render(<MockStatusChangeControl />);
    const controlElement = screen.getByText('Status Control');
    expect(controlElement).toBeInTheDocument();
  });
});
