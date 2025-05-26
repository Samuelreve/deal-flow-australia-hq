
/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ParticipantsList from '../ParticipantsList';

// Mock data for testing
const mockParticipants = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Viewer' },
];

describe('ParticipantsList Component', () => {
  it('renders without crashing', () => {
    render(<ParticipantsList participants={mockParticipants} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays the correct number of participants', () => {
    render(<ParticipantsList participants={mockParticipants} />);
    const participantItems = screen.getAllByRole('listitem');
    expect(participantItems.length).toBe(mockParticipants.length);
  });

  it('displays "No participants" message when the list is empty', () => {
    render(<ParticipantsList participants={[]} />);
    expect(screen.getByText('No participants')).toBeInTheDocument();
  });

  it('displays participant details correctly', () => {
    render(<ParticipantsList participants={mockParticipants} />);
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
});
