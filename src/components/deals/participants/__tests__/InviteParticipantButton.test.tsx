
/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InviteParticipantButton from '../InviteParticipantButton';

describe('InviteParticipantButton Component', () => {
  it('renders the button with the correct text', () => {
    render(<InviteParticipantButton dealId="123" />);
    const buttonElement = screen.getByText('Invite Participant');
    expect(buttonElement).toBeInTheDocument();
  });
});
