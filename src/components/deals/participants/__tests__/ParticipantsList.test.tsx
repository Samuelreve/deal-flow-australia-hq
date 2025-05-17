
import React from "react";
import { render, screen } from "@testing-library/react";
import ParticipantsList from "../ParticipantsList";
import { DealParticipant } from "../../DealParticipants";
import { describe, it, expect, vi } from "vitest";

// Mock the ParticipantItem component
vi.mock("../ParticipantItem", () => ({
  default: ({ participant, currentUserId }: { 
    participant: DealParticipant; 
    currentUserId?: string 
  }) => (
    <div data-testid="participant-item">
      <span>Name: {participant.profile_name}</span>
      <span>Role: {participant.role}</span>
      {currentUserId === participant.user_id && <span>Current User</span>}
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

  it("renders loading state", () => {
    render(
      <ParticipantsList 
        participants={[]} 
        isLoading={true} 
        error={null} 
      />
    );

    expect(screen.getByText(/loading participants/i)).toBeInTheDocument();
  });

  it("renders error message", () => {
    const errorMessage = "Failed to load participants";
    render(
      <ParticipantsList 
        participants={[]} 
        isLoading={false} 
        error={errorMessage} 
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("renders empty state message", () => {
    render(
      <ParticipantsList 
        participants={[]} 
        isLoading={false} 
        error={null} 
      />
    );

    expect(screen.getByText(/no participants found/i)).toBeInTheDocument();
  });

  it("renders list of participants", () => {
    render(
      <ParticipantsList 
        participants={mockParticipants} 
        isLoading={false} 
        error={null} 
      />
    );

    const participantItems = screen.getAllByTestId("participant-item");
    expect(participantItems).toHaveLength(2);
    
    expect(screen.getByText("Name: Seller User")).toBeInTheDocument();
    expect(screen.getByText("Name: Buyer User")).toBeInTheDocument();
  });

  it("passes currentUserId to child components", () => {
    const currentUserId = "123"; // Same as first mock participant
    
    render(
      <ParticipantsList 
        participants={mockParticipants} 
        currentUserId={currentUserId}
        isLoading={false} 
        error={null} 
      />
    );

    expect(screen.getByText("Current User")).toBeInTheDocument();
  });
});
