
/// <reference types="vitest" />
import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DealHeader from '../DealHeader';
import { Deal } from '@/types/deal';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock the status components
vi.mock('@/components/deals/status/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>
}));

vi.mock('@/components/deals/status/StatusChangeControl', () => ({
  default: () => <div data-testid="status-control">Status Control</div>
}));

vi.mock('@/components/deals/DealHealth', () => ({
  default: ({ healthScore }: { healthScore: number }) => <span data-testid="health-score">Health: {healthScore}</span>
}));

vi.mock('@/components/deals/DealSummaryButton', () => ({
  default: () => <button data-testid="deal-summary">Deal Summary</button>
}));

describe('DealHeader Component', () => {
  const mockDeal: Deal = {
    id: '123',
    title: 'Test Deal',
    description: 'A test deal',
    status: 'active',
    healthScore: 75,
    createdAt: new Date('2024-05-03T12:00:00.000Z'),
    updatedAt: new Date('2024-05-03T12:00:00.000Z'),
    sellerId: 'user123',
    buyerId: 'buyer123',
    milestones: [],
    documents: [],
    comments: [],
    participants: []
  };

  it('renders deal information correctly', () => {
    render(<DealHeader deal={mockDeal} isParticipant={true} />);
    expect(screen.getByText('Test Deal')).toBeInTheDocument();
    expect(screen.getByText('A test deal')).toBeInTheDocument();
  });

  it('displays health score', () => {
    render(<DealHeader deal={mockDeal} isParticipant={true} />);
    expect(screen.getByTestId('health-score')).toBeInTheDocument();
  });

  it('shows status control', () => {
    render(<DealHeader deal={mockDeal} isParticipant={true} />);
    expect(screen.getByTestId('status-control')).toBeInTheDocument();
  });

  it('shows deal summary button when user is participant', () => {
    render(<DealHeader deal={mockDeal} isParticipant={true} />);
    expect(screen.getByTestId('deal-summary')).toBeInTheDocument();
  });
});
