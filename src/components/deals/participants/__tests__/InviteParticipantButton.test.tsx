
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InviteParticipantButton from "../InviteParticipantButton";

describe("InviteParticipantButton", () => {
  const mockOnClick = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly when user can invite participants", () => {
    render(
      <InviteParticipantButton 
        onClick={mockOnClick} 
        canInviteParticipants={true} 
      />
    );

    const button = screen.getByRole("button", { name: /invite participant/i });
    expect(button).toBeInTheDocument();
  });

  it("doesn't render when user cannot invite participants", () => {
    const { container } = render(
      <InviteParticipantButton 
        onClick={mockOnClick} 
        canInviteParticipants={false} 
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("calls onClick handler when button is clicked", async () => {
    render(
      <InviteParticipantButton 
        onClick={mockOnClick} 
        canInviteParticipants={true} 
      />
    );
    
    const button = screen.getByRole("button", { name: /invite participant/i });
    await userEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
