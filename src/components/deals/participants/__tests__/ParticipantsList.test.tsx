
import React from "react";
import { render, screen } from "@testing-library/react";
import ParticipantsList from "../ParticipantsList";
import { DealParticipant } from "../../DealParticipants";
import { describe, test, expect, vi } from "vitest";
import '@testing-library/jest-dom';

// Mock the ParticipantItem component
vi.mock("../ParticipantItem", () => ({
  default: ({ participant, isCurrentUser }: { 
    participant: DealParticipant; 
    isCurrentUser?: boolean 
  }) => (
    <div data-testid="participant-item">
      <span>Name: {participant.profile_name}</span>
      <span>Role: {participant.role}</span>
      {isCurrentUser && <span>Current User</span>}
    </div>
  )
}));

describe("ParticipantsList", () => {
  const mockParticipants: DealParticipant[] = [
    {
      user_id: "123",
      deal_id: "deal-123",
      role: "seller",
      joined_at: "2024-05-10T12:00:00Z",
      profile_name: "Seller User",
      profile_avatar_url: null
    },
    {
      user_id: "456",
      deal_id: "deal-123",
      role: "buyer",
      joined_at: "2024-05-11T14:00:00Z",
      profile_name: "Buyer User",
      profile_avatar_url: "https://example.com/avatar.jpg"
    }
  ];

  const mockDealId = "deal-123";

  test("renders loading state", () => {
    render(
      <ParticipantsList 
        participants={[]} 
        isLoading={true} 
        error={null}
        dealId={mockDealId}
      />
    );

    expect(screen.getAllByTestId("skeleton")).toBeTruthy();
  });

  test("renders error message", () => {
    const errorMessage = "Failed to load participants";
    render(
      <ParticipantsList 
        participants={[]} 
        isLoading={false} 
        error={errorMessage}
        dealId={mockDealId}
      />
    );

    expect(screen.getByText(/Error loading participants/i)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test("renders empty state message", () => {
    render(
      <ParticipantsList 
        participants={[]} 
        isLoading={false} 
        error={null}
        dealId={mockDealId}
      />
    );

    expect(screen.getByText(/No participants found/i)).toBeInTheDocument();
  });

  test("renders list of participants", () => {
    render(
      <ParticipantsList 
        participants={mockParticipants} 
        isLoading={false} 
        error={null}
        dealId={mockDealId}
      />
    );

    const participantItems = screen.getAllByTestId("participant-item");
    expect(participantItems).toHaveLength(2);
    
    expect(screen.getByText("Name: Seller User")).toBeInTheDocument();
    expect(screen.getByText("Name: Buyer User")).toBeInTheDocument();
  });

  test("passes currentUserId to child components", () => {
    const currentUserId = "123"; // Same as first mock participant
    
    render(
      <ParticipantsList 
        participants={mockParticipants} 
        currentUserId={currentUserId}
        isLoading={false} 
        error={null}
        dealId={mockDealId}
      />
    );

    expect(screen.getByText("Current User")).toBeInTheDocument();
  });
});
