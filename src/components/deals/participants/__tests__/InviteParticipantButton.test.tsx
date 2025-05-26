
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InviteParticipantButton from "../InviteParticipantButton";
import { describe, test, expect, vi, afterEach } from "vitest";
import '@testing-library/jest-dom';

describe("InviteParticipantButton", () => {
  const mockOnClick = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders correctly when user can invite participants", () => {
    render(
      <InviteParticipantButton 
        onClick={mockOnClick} 
        canInviteParticipants={true} 
      />
    );

    const button = screen.getByRole("button", { name: /invite participant/i });
    expect(button).toBeInTheDocument();
  });

  test("doesn't render when user cannot invite participants", () => {
    const { container } = render(
      <InviteParticipantButton 
        onClick={mockOnClick} 
        canInviteParticipants={false} 
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test("calls onClick handler when button is clicked", async () => {
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
