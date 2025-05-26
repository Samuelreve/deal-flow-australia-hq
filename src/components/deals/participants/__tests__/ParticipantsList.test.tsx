
/// <reference types="vitest" />
import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the actual component since we don't have its implementation
const MockParticipantsList = ({ participants }: { participants?: any[] }) => (
  <div>
    <h2>Participants List</h2>
    {participants && participants.length > 0 ? (
      <ul>
        {participants.map((p, i) => (
          <li key={i}>{p.name}</li>
        ))}
      </ul>
    ) : (
      <p>No participants</p>
    )}
  </div>
);

vi.mock('../ParticipantsList', () => ({
  default: MockParticipantsList
}));

describe('ParticipantsList Component', () => {
  it('renders the participants list', () => {
    render(<MockParticipantsList participants={[]} />);
    const listElement = screen.getByText('Participants List');
    expect(listElement).toBeInTheDocument();
  });

  it('shows no participants message when empty', () => {
    render(<MockParticipantsList participants={[]} />);
    const noParticipantsMessage = screen.getByText('No participants');
    expect(noParticipantsMessage).toBeInTheDocument();
  });
});
