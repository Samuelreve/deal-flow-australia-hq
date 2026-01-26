/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import EmptyDealsState from '../EmptyDealsState';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EmptyDealsState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render "No deals found" heading', () => {
      renderWithRouter(<EmptyDealsState isFiltered={false} canCreateDeals={true} />);
      expect(screen.getByText('No deals found')).toBeInTheDocument();
    });

    it('should render filter icon', () => {
      renderWithRouter(<EmptyDealsState isFiltered={false} canCreateDeals={true} />);
      // Filter icon should be present (as an SVG)
      const card = screen.getByRole('heading', { name: 'No deals found' }).parentElement;
      expect(card).toBeInTheDocument();
    });
  });

  describe('when not filtered', () => {
    it('should show "Create a new deal to get started" message', () => {
      renderWithRouter(<EmptyDealsState isFiltered={false} canCreateDeals={true} />);
      expect(screen.getByText('Create a new deal to get started')).toBeInTheDocument();
    });

    it('should show "Create New Deal" button when canCreateDeals is true', () => {
      renderWithRouter(<EmptyDealsState isFiltered={false} canCreateDeals={true} />);
      expect(screen.getByRole('button', { name: /create new deal/i })).toBeInTheDocument();
    });

    it('should navigate to /create-deal when button is clicked', () => {
      renderWithRouter(<EmptyDealsState isFiltered={false} canCreateDeals={true} />);

      const button = screen.getByRole('button', { name: /create new deal/i });
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/create-deal');
    });

    it('should not show button when canCreateDeals is false', () => {
      renderWithRouter(<EmptyDealsState isFiltered={false} canCreateDeals={false} />);
      expect(screen.queryByRole('button', { name: /create new deal/i })).not.toBeInTheDocument();
    });
  });

  describe('when filtered', () => {
    it('should show "Try adjusting your search or filters" message', () => {
      renderWithRouter(<EmptyDealsState isFiltered={true} canCreateDeals={true} />);
      expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
    });

    it('should not show "Create New Deal" button even when canCreateDeals is true', () => {
      renderWithRouter(<EmptyDealsState isFiltered={true} canCreateDeals={true} />);
      expect(screen.queryByRole('button', { name: /create new deal/i })).not.toBeInTheDocument();
    });

    it('should not show "Create New Deal" button when canCreateDeals is false', () => {
      renderWithRouter(<EmptyDealsState isFiltered={true} canCreateDeals={false} />);
      expect(screen.queryByRole('button', { name: /create new deal/i })).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<EmptyDealsState isFiltered={false} canCreateDeals={true} />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('No deals found');
    });
  });

  describe('button variations', () => {
    it('should show Plus icon in button', () => {
      renderWithRouter(<EmptyDealsState isFiltered={false} canCreateDeals={true} />);
      const button = screen.getByRole('button', { name: /create new deal/i });
      // Check button contains SVG (Plus icon)
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
