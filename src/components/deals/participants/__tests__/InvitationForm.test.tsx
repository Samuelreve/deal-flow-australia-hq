
/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InvitationForm from '../InvitationForm';
import { UserRole } from '@/types/auth';

// Mock the auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the hook
vi.mock('@/hooks/useInviteParticipant', () => ({
  useInviteParticipant: vi.fn(),
}));

// Mock the toast functionality
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('InvitationForm', () => {
  const mockDealId = 'mock-deal-id';
  const mockOnSubmitted = vi.fn();
  const mockInviteParticipant = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock the hook
    vi.mocked(require('@/hooks/useInviteParticipant').useInviteParticipant).mockReturnValue({
      inviteParticipant: mockInviteParticipant,
      isSubmitting: false
    });
  });
  
  it('renders the form correctly', () => {
    render(<InvitationForm dealId={mockDealId} onSubmitted={mockOnSubmitted} />);
    
    // Check that the form elements are rendered
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send invitation/i })).toBeInTheDocument();
  });
  
  it('handles form submission correctly', async () => {
    // Mock successful submission
    mockInviteParticipant.mockResolvedValue(true);
    
    render(<InvitationForm dealId={mockDealId} onSubmitted={mockOnSubmitted} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'invitee@example.com' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));
    
    // Wait for the submission to complete
    await waitFor(() => {
      expect(mockInviteParticipant).toHaveBeenCalled();
    });
  });
  
  it('handles form validation', async () => {
    render(<InvitationForm dealId={mockDealId} onSubmitted={mockOnSubmitted} />);
    
    // Submit the form without filling it out
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));
    
    // Check that validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });
  
  it('handles API errors correctly', async () => {
    // Mock API error response
    mockInviteParticipant.mockResolvedValue(false);
    
    render(<InvitationForm dealId={mockDealId} onSubmitted={mockOnSubmitted} />);
    
    // Fill out the form correctly
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'invitee@example.com' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));
    
    // Wait for the submission to complete
    await waitFor(() => {
      expect(mockInviteParticipant).toHaveBeenCalled();
    });
  });
});
