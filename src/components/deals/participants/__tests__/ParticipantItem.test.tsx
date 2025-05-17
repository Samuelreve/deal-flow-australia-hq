
import React from "react";
import { render, screen } from "@testing-library/react";
import ParticipantItem from "../ParticipantItem";
import { DealParticipant } from "../../DealParticipants";
import { describe, it, expect } from "vitest";

describe("ParticipantItem", () => {
  const mockParticipant: DealParticipant = {
    user_id: "123",
    deal_id: "deal-123",
    role: "buyer",
    joined_at: "2024-05-10T12:00:00Z",
    profile_name: "John Doe",
    profile_avatar_url: "https://example.com/avatar.jpg"
  };

  it("renders participant information correctly", () => {
    render(<ParticipantItem participant={mockParticipant} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText(/buyer/i)).toBeInTheDocument();
    expect(screen.getByText(/joined/i)).toBeInTheDocument();
    
    // Avatar should be present
    const avatar = screen.getByRole("img", { hidden: true });
    expect(avatar).toBeInTheDocument();
  });

  it("highlights when the participant is the current user", () => {
    render(
      <ParticipantItem 
        participant={mockParticipant} 
        currentUserId={mockParticipant.user_id} 
      />
    );

    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("doesn't show 'You' label for other participants", () => {
    render(
      <ParticipantItem 
        participant={mockParticipant} 
        currentUserId="different-user" 
      />
    );

    expect(screen.queryByText("You")).not.toBeInTheDocument();
  });

  it("displays fallback for missing profile name", () => {
    const participantWithoutName = {
      ...mockParticipant,
      profile_name: null
    };
    
    render(<ParticipantItem participant={participantWithoutName} />);
    
    expect(screen.getByText("Unknown User")).toBeInTheDocument();
  });

  it("formats role correctly", () => {
    const roles = ["seller", "buyer", "lawyer", "admin"] as const;
    
    roles.forEach(role => {
      const participantWithRole = {
        ...mockParticipant,
        role
      };
      
      const { unmount } = render(<ParticipantItem participant={participantWithRole} />);
      
      const expectedRole = role.charAt(0).toUpperCase() + role.slice(1);
      expect(screen.getByText(expectedRole)).toBeInTheDocument();
      
      unmount();
    });
  });
});
