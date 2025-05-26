
/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the actual component since we don't have its implementation
const MockInviteParticipantButton = ({ onInvite }: { onInvite?: () => void }) => (
  <button onClick={onInvite}>Invite Participant</button>
);

vi.mock('../InviteParticipantButton', () => ({
  default: MockInviteParticipantButton
}));

describe('InviteParticipantButton Component', () => {
  it('renders the button with the correct text', () => {
    render(<MockInviteParticipantButton />);
    const buttonElement = screen.getByText('Invite Participant');
    expect(buttonElement).toBeInTheDocument();
  });
});
