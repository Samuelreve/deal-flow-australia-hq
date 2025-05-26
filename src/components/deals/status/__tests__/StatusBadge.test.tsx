import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders the correct status text and class', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Active').closest('div')).toHaveClass('bg-green-100 text-green-800');
  });

  it('renders "Inactive" status correctly', () => {
    render(<StatusBadge status="inactive" />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText('Inactive').closest('div')).toHaveClass('bg-red-100 text-red-800');
  });

  it('renders "Pending" status correctly', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Pending').closest('div')).toHaveClass('bg-yellow-100 text-yellow-800');
  });

  it('renders "Completed" status correctly', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Completed').closest('div')).toHaveClass('bg-gray-100 text-gray-800');
  });

  it('renders "Draft" status correctly', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Draft').closest('div')).toHaveClass('bg-blue-100 text-blue-800');
  });

  it('renders "Archived" status correctly', () => {
    render(<StatusBadge status="archived" />);
    expect(screen.getByText('Archived')).toBeInTheDocument();
    expect(screen.getByText('Archived').closest('div')).toHaveClass('bg-gray-100 text-gray-800');
  });

  it('renders "Negotiating" status correctly', () => {
    render(<StatusBadge status="negotiating" />);
    expect(screen.getByText('Negotiating')).toBeInTheDocument();
    expect(screen.getByText('Negotiating').closest('div')).toHaveClass('bg-purple-100 text-purple-800');
  });

  it('renders "Review" status correctly', () => {
    render(<StatusBadge status="review" />);
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Review').closest('div')).toHaveClass('bg-indigo-100 text-indigo-800');
  });

  it('renders "Approved" status correctly', () => {
    render(<StatusBadge status="approved" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Approved').closest('div')).toHaveClass('bg-teal-100 text-teal-800');
  });

  it('renders "Declined" status correctly', () => {
    render(<StatusBadge status="declined" />);
    expect(screen.getByText('Declined')).toBeInTheDocument();
    expect(screen.getByText('Declined').closest('div')).toHaveClass('bg-orange-100 text-orange-800');
  });

  it('renders "Expired" status correctly', () => {
    render(<StatusBadge status="expired" />);
    expect(screen.getByText('Expired')).toBeInTheDocument();
    expect(screen.getByText('Expired').closest('div')).toHaveClass('bg-red-100 text-red-800');
  });

  it('renders "On Hold" status correctly', () => {
    render(<StatusBadge status="on hold" />);
    expect(screen.getByText('On Hold')).toBeInTheDocument();
    expect(screen.getByText('On Hold').closest('div')).toHaveClass('bg-gray-100 text-gray-800');
  });

  it('renders "Dispute" status correctly', () => {
    render(<StatusBadge status="dispute" />);
    expect(screen.getByText('Dispute')).toBeInTheDocument();
    expect(screen.getByText('Dispute').closest('div')).toHaveClass('bg-red-100 text-red-800');
  });

  it('renders "Legal Review" status correctly', () => {
    render(<StatusBadge status="legal review" />);
    expect(screen.getByText('Legal Review')).toBeInTheDocument();
    expect(screen.getByText('Legal Review').closest('div')).toHaveClass('bg-indigo-100 text-indigo-800');
  });

  it('renders "Financial Review" status correctly', () => {
    render(<StatusBadge status="financial review" />);
    expect(screen.getByText('Financial Review')).toBeInTheDocument();
    expect(screen.getByText('Financial Review').closest('div')).toHaveClass('bg-emerald-100 text-emerald-800');
  });

  it('renders "Due Diligence" status correctly', () => {
    render(<StatusBadge status="due diligence" />);
    expect(screen.getByText('Due Diligence')).toBeInTheDocument();
    expect(screen.getByText('Due Diligence').closest('div')).toHaveClass('bg-cyan-100 text-cyan-800');
  });

  it('renders "Closing" status correctly', () => {
    render(<StatusBadge status="closing" />);
    expect(screen.getByText('Closing')).toBeInTheDocument();
    expect(screen.getByText('Closing').closest('div')).toHaveClass('bg-green-100 text-green-800');
  });

  it('renders "Awaiting Approval" status correctly', () => {
    render(<StatusBadge status="awaiting approval" />);
    expect(screen.getByText('Awaiting Approval')).toBeInTheDocument();
    expect(screen.getByText('Awaiting Approval').closest('div')).toHaveClass('bg-yellow-100 text-yellow-800');
  });

  it('renders "Extended" status correctly', () => {
    render(<StatusBadge status="extended" />);
    expect(screen.getByText('Extended')).toBeInTheDocument();
    expect(screen.getByText('Extended').closest('div')).toHaveClass('bg-purple-100 text-purple-800');
  });

  it('renders "Amended" status correctly', () => {
    render(<StatusBadge status="amended" />);
    expect(screen.getByText('Amended')).toBeInTheDocument();
    expect(screen.getByText('Amended').closest('div')).toHaveClass('bg-blue-100 text-blue-800');
  });
});
