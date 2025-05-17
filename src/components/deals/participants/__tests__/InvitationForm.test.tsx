
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import InvitationForm from "../InvitationForm";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Mock the required dependencies
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn()
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(() => ({
      data: null,
      error: null
    }))
  }
}));

describe("InvitationForm", () => {
  const mockDealId = "deal-123";
  const mockOnInvitationSent = vi.fn();
  const mockUser = { 
    id: "user-123", 
    email: "user@example.com",
    name: "Test User",
    role: "admin"
  };
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default mock values
    vi.mocked(useAuth).mockReturnValue({ 
      user: mockUser,
      isAuthenticated: true,
      session: null,
      loading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn()
    });
  });

  it("renders the form correctly", () => {
    render(
      <InvitationForm 
        dealId={mockDealId} 
        onInvitationSent={mockOnInvitationSent} 
      />
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send invitation/i })).toBeInTheDocument();
  });

  it("updates form data on input change", async () => {
    render(
      <InvitationForm 
        dealId={mockDealId} 
        onInvitationSent={mockOnInvitationSent} 
      />
    );

    const emailInput = screen.getByLabelText(/email address/i);
    await userEvent.type(emailInput, "test@example.com");
    
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("displays validation error when form is incomplete", async () => {
    render(
      <InvitationForm 
        dealId={mockDealId} 
        onInvitationSent={mockOnInvitationSent} 
      />
    );

    const submitButton = screen.getByRole("button", { name: /send invitation/i });
    await userEvent.click(submitButton);
    
    expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
  });

  it("handles successful form submission", async () => {
    // Mock the Supabase RPC call to return success
    const mockRpcResponse = {
      data: { success: true, message: "Invitation sent successfully" },
      error: null
    };
    
    const mockSupabase = {
      rpc: vi.fn().mockResolvedValue(mockRpcResponse)
    };
    
    // Replace the imported supabase object with our mock
    vi.mocked(require("@/integrations/supabase/client").supabase).rpc = mockSupabase.rpc;

    render(
      <InvitationForm 
        dealId={mockDealId} 
        onInvitationSent={mockOnInvitationSent} 
      />
    );

    // Fill out the form
    await userEvent.type(screen.getByLabelText(/email address/i), "test@example.com");
    
    // Select a role (using the SelectTrigger component)
    const roleSelect = screen.getByText(/select a role/i);
    await userEvent.click(roleSelect);
    
    // Click on a role option (assuming the dropdown is now open)
    const buyerOption = screen.getByText(/buyer/i);
    await userEvent.click(buyerOption);
    
    // Submit the form
    await userEvent.click(screen.getByRole("button", { name: /send invitation/i }));
    
    // Wait for the async action to complete
    await waitFor(() => {
      // Check if the appropriate function was called
      expect(mockSupabase.rpc).toHaveBeenCalledWith("create_deal_invitation", {
        p_deal_id: mockDealId,
        p_invitee_email: "test@example.com",
        p_invitee_role: "buyer"
      });
      
      // Check if the success toast was shown
      expect(toast.success).toHaveBeenCalled();
      
      // Check if the callback was called
      expect(mockOnInvitationSent).toHaveBeenCalled();
    });
  });

  it("handles submission error", async () => {
    // Mock the Supabase RPC call to return an error
    const mockError = new Error("Test error message");
    const mockRpcResponse = {
      data: null,
      error: mockError
    };
    
    const mockSupabase = {
      rpc: vi.fn().mockResolvedValue(mockRpcResponse)
    };
    
    // Replace the imported supabase object with our mock
    vi.mocked(require("@/integrations/supabase/client").supabase).rpc = mockSupabase.rpc;

    render(
      <InvitationForm 
        dealId={mockDealId} 
        onInvitationSent={mockOnInvitationSent} 
      />
    );

    // Fill out the form
    await userEvent.type(screen.getByLabelText(/email address/i), "test@example.com");
    
    // Select a role
    const roleSelect = screen.getByText(/select a role/i);
    await userEvent.click(roleSelect);
    const buyerOption = screen.getByText(/buyer/i);
    await userEvent.click(buyerOption);
    
    // Submit the form
    await userEvent.click(screen.getByRole("button", { name: /send invitation/i }));
    
    // Wait for the async action to complete
    await waitFor(() => {
      // Check if the error message is displayed
      expect(screen.getByText(/failed to send invitation/i)).toBeInTheDocument();
      
      // Check if the error toast was shown
      expect(toast.error).toHaveBeenCalled();
      
      // Check that the callback was not called
      expect(mockOnInvitationSent).not.toHaveBeenCalled();
    });
  });

  it("disables the form when not authenticated", () => {
    // Mock unauthenticated user
    vi.mocked(useAuth).mockReturnValue({ 
      user: null,
      isAuthenticated: false,
      session: null,
      loading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn()
    });
    
    render(
      <InvitationForm 
        dealId={mockDealId} 
        onInvitationSent={mockOnInvitationSent} 
      />
    );

    // Form should show an error about authentication
    expect(screen.getByText(/you must be logged in/i)).toBeInTheDocument();
  });
});
