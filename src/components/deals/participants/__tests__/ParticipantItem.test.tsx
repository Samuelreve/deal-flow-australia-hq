import React from "react";
import { render, screen } from "@testing-library/react";
import ParticipantItem from "../ParticipantItem";
import { DealParticipant } from "../../DealParticipants";
import { describe, test, expect, vi } from "vitest";
import '@testing-library/jest-dom';

describe("ParticipantItem", () => {
  const mockParticipant: DealParticipant = {
    user_id: "123",
    deal_id: "deal-123",
    role: "buyer",
    joined_at: "2024-05-10T12:00:00Z",
    profile_name: "John Doe",
    profile_avatar_url: "https://example.com/avatar.jpg"
  };

  test("renders participant information correctly", () => {
    render(<ParticipantItem participant={mockParticipant} dealId="deal-123" />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("buyer")).toBeInTheDocument();
    
    // Avatar should be present
    const avatar = screen.getByRole("img", { hidden: true });
    expect(avatar).toBeInTheDocument();
  });

  test("highlights when the participant is the current user", () => {
    render(
      <ParticipantItem 
        participant={mockParticipant} 
        isCurrentUser={true}
        dealId="deal-123"
      />
    );

    expect(screen.getByText(/You/i)).toBeInTheDocument();
  });

  test("doesn't show 'You' label for other participants", () => {
    render(
      <ParticipantItem 
        participant={mockParticipant}
        isCurrentUser={false}
        dealId="deal-123"
      />
    );

    expect(screen.queryByText(/You/i)).not.toBeInTheDocument();
  });

  test("displays fallback for missing profile name", () => {
    const participantWithoutName = {
      ...mockParticipant,
      profile_name: null
    };
    
    render(<ParticipantItem participant={participantWithoutName} dealId="deal-123" />);
    
    expect(screen.getByText("Unknown User")).toBeInTheDocument();
  });

  test("formats role correctly with proper badge variant", () => {
    const roles = ["seller", "buyer", "lawyer", "admin"] as const;
    
    roles.forEach(role => {
      const participantWithRole = {
        ...mockParticipant,
        role
      };
      
      const { unmount } = render(<ParticipantItem participant={participantWithRole} dealId="deal-123" />);
      
      expect(screen.getByText(role)).toBeInTheDocument();
      
      unmount();
    });
  });
});
