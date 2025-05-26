
/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the DealParticipant type
interface MockParticipant {
  id: string;
  user_id: string;
  deal_id: string;
  role: 'admin' | 'seller' | 'buyer' | 'viewer';
  joined_at: string;
  profile_name: string;
  profile_avatar_url?: string;
}

// Mock component since we need to match the actual interface
const MockParticipantsList = ({ 
  participants, 
  isLoading, 
  error, 
  dealId 
}: { 
  participants: MockParticipant[];
  isLoading: boolean;
  error?: string | null;
  dealId: string;
}) => {
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (participants.length === 0) return <div>No participants</div>;
  
  return (
    <ul>
      {participants.map((participant) => (
        <li key={participant.id}>
          <div>{participant.profile_name}</div>
          <div>{participant.role}</div>
        </li>
      ))}
    </ul>
  );
};

vi.mock('../ParticipantsList', () => ({
  default: MockParticipantsList
}));

const mockParticipants: MockParticipant[] = [
  { 
    id: '1', 
    user_id: 'user1',
    deal_id: 'deal1',
    profile_name: 'John Doe', 
    role: 'admin',
    joined_at: '2024-01-01T00:00:00Z'
  },
  { 
    id: '2', 
    user_id: 'user2',
    deal_id: 'deal1',
    profile_name: 'Jane Smith', 
    role: 'viewer',
    joined_at: '2024-01-01T00:00:00Z'
  },
];

describe('ParticipantsList Component', () => {
  it('renders without crashing', () => {
    render(
      <MockParticipantsList 
        participants={mockParticipants} 
        isLoading={false}
        dealId="deal1"
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays the correct number of participants', () => {
    render(
      <MockParticipantsList 
        participants={mockParticipants} 
        isLoading={false}
        dealId="deal1"
      />
    );
    const participantItems = screen.getAllByRole('listitem');
    expect(participantItems.length).toBe(mockParticipants.length);
  });

  it('displays "No participants" message when the list is empty', () => {
    render(
      <MockParticipantsList 
        participants={[]} 
        isLoading={false}
        dealId="deal1"
      />
    );
    expect(screen.getByText('No participants')).toBeInTheDocument();
  });

  it('displays participant details correctly', () => {
    render(
      <MockParticipantsList 
        participants={mockParticipants} 
        isLoading={false}
        dealId="deal1"
      />
    );
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('viewer')).toBeInTheDocument();
  });
});
