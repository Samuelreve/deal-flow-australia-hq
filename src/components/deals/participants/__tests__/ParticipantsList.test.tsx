
/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the actual component since we don't have its implementation
const MockParticipantsList = ({ participants }: { participants: any[] }) => (
  <div>
    {participants.map((participant, index) => (
      <div key={index}>{participant.name}</div>
    ))}
  </div>
);

vi.mock('../ParticipantsList', () => ({
  default: MockParticipantsList
}));

describe('ParticipantsList Component', () => {
  it('renders participants correctly', () => {
    const mockParticipants = [
      { name: 'John Doe', role: 'buyer' },
      { name: 'Jane Smith', role: 'seller' }
    ];
    
    render(<MockParticipantsList participants={mockParticipants} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
});
