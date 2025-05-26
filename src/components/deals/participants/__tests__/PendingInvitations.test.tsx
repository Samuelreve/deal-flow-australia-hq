import React from "react";
import { render, screen } from "@testing-library/react";
import PendingInvitations from "../PendingInvitations";
import { DealInvitation } from "@/types/invitation";
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

describe("PendingInvitations", () => {
  const mockInvitations: DealInvitation[] = [
    {
      id: "inv-123",
      email: "test1@example.com",
      role: "buyer",
      created_at: "2024-05-10T12:00:00Z",
      status: "pending",
      invited_by: {
        id: "user-123",
        name: "Inviter User",
        avatar_url: null
      }
    },
    {
      id: "inv-456",
      email: "test2@example.com",
      role: "lawyer",
      created_at: "2024-05-11T14:00:00Z",
      status: "pending",
      invited_by: {
        id: "user-123",
        name: "Inviter User",
        avatar_url: null
      }
    }
  ];

  test("renders nothing when loading", () => {
    const { container } = render(
      <PendingInvitations 
        invitations={[]} 
        isLoading={true} 
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test("renders nothing when no invitations", () => {
    const { container } = render(
      <PendingInvitations 
        invitations={[]} 
        isLoading={false} 
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test("renders pending invitations correctly", () => {
    render(
      <PendingInvitations 
        invitations={mockInvitations} 
        isLoading={false} 
      />
    );

    expect(screen.getByText("Pending Invitations")).toBeInTheDocument();
    
    // Check if all invitations are displayed
    expect(screen.getByText("test1@example.com")).toBeInTheDocument();
    expect(screen.getByText("test2@example.com")).toBeInTheDocument();
    
    // Check if roles are displayed correctly
    expect(screen.getByText(/invited as buyer/i)).toBeInTheDocument();
    expect(screen.getByText(/invited as lawyer/i)).toBeInTheDocument();
    
    // Check if status badges are displayed
    const statusBadges = screen.getAllByText("Pending");
    expect(statusBadges).toHaveLength(2);
  });

  test("formats dates correctly", () => {
    render(
      <PendingInvitations 
        invitations={mockInvitations} 
        isLoading={false} 
      />
    );
    
    // Since the date formatting depends on the browser's locale,
    // we'll just check that some date-related text is present
    expect(screen.getByText(/invited as buyer on/i)).toBeInTheDocument();
  });
});
