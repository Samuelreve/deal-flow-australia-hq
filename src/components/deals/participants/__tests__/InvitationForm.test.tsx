import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InvitationForm from '../InvitationForm';

// Mock the auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the API service
vi.mock('@/services/dealInvitationService', () => ({
  inviteParticipant: vi.fn(),
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
    
    // Mock the invitation service
    vi.mocked(require('@/services/dealInvitationService').inviteParticipant).mockImplementation(mockInviteParticipant);
  });
  
  it('renders the form correctly', () => {
    // Mock the auth context with a logged-in user
    (useAuth as any).mockReturnValue({
      user: {
        id: 'user-123',
        email: 'user@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01',
        profile: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          role: 'seller' as UserRole,
        },
      },
      isAuthenticated: true,
      session: { access_token: 'mock-token' },
      loading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });
    
    render(<InvitationForm dealId={mockDealId} onSubmitted={mockOnSubmitted} />);
    
    // Check that the form elements are rendered
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send invitation/i })).toBeInTheDocument();
  });
  
  it('handles form submission correctly', async () => {
    // Mock successful API response
    mockInviteParticipant.mockResolvedValue({
      success: true,
      message: 'Invitation sent successfully',
    });
    
    // Mock the auth context with a logged-in user
    (useAuth as any).mockReturnValue({
      user: {
        id: 'user-123',
        email: 'user@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01',
        profile: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          role: 'seller' as UserRole,
        },
      },
      isAuthenticated: true,
      session: { access_token: 'mock-token' },
      loading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });
    
    render(<InvitationForm dealId={mockDealId} onSubmitted={mockOnSubmitted} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'invitee@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/role/i), {
      target: { value: 'buyer' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));
    
    // Wait for the submission to complete and check the expected outcomes
    await waitFor(() => {
      expect(mockInviteParticipant).toHaveBeenCalledWith(
        mockDealId,
        'invitee@example.com',
        'buyer',
        expect.anything() // The access token
      );
      expect(mockOnSubmitted).toHaveBeenCalled();
      expect(require('sonner').toast.success).toHaveBeenCalledWith(expect.stringContaining('sent'));
    });
  });
  
  it('handles form validation', async () => {
    // Mock the auth context with a logged-in user
    (useAuth as any).mockReturnValue({
      user: null,
      isAuthenticated: false,
      session: null,
      loading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });
    
    render(<InvitationForm dealId={mockDealId} onSubmitted={mockOnSubmitted} />);
    
    // Submit the form without filling it out
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));
    
    // Check that validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
    
    // Fill out the email field with an invalid email
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'not-an-email' },
    });
    
    // Submit again
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));
    
    // Check for validation error about invalid email
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });
  
  it('handles API errors correctly', async () => {
    // Mock API error response
    const errorMessage = 'Failed to send invitation';
    mockInviteParticipant.mockRejectedValue(new Error(errorMessage));
    
    // Mock the auth context with a logged-in user
    (useAuth as any).mockReturnValue({
      user: {
        id: 'user-123',
        email: 'user@example.com',
        profile: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          role: 'seller' as UserRole,
        },
      },
      isAuthenticated: true,
      session: { access_token: 'mock-token' },
      loading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });
    
    render(<InvitationForm dealId={mockDealId} onSubmitted={mockOnSubmitted} />);
    
    // Fill out the form correctly
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'invitee@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/role/i), {
      target: { value: 'buyer' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));
    
    // Check that the error is handled
    await waitFor(() => {
      expect(require('sonner').toast.error).toHaveBeenCalledWith(expect.stringContaining(errorMessage));
      expect(mockOnSubmitted).not.toHaveBeenCalled(); // The onSubmitted callback should not be called on error
    });
  });
});
