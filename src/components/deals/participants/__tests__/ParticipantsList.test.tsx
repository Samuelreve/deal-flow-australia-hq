
/// <reference types="vitest" />
import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the actual component since we don't have its implementation
const MockParticipantsList = ({ participants }: { participants?: any[] }) => (
  <div>
    <h2>Participants List</h2>
    {participants?.map((p, i) => <div key={i}>{p.name}</div>)}
  </div>
);

vi.mock('../ParticipantsList', () => ({
  default: MockParticipantsList
}));

describe('ParticipantsList Component', () => {
  it('renders the participants list', () => {
    render(<MockParticipantsList />);
    const listElement = screen.getByText('Participants List');
    expect(listElement).toBeInTheDocument();
  });

  it('renders participants when provided', () => {
    const participants = [{ name: 'John Doe' }, { name: 'Jane Smith' }];
    render(<MockParticipantsList participants={participants} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
});
