
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom'; // Add this import for DOM matchers
import { StatusChangeControl } from '../StatusChangeControl';
import { supabase } from "@/integrations/supabase/client";

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn()
  }
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('StatusChangeControl Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful supabase response by default
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: { success: true },
      error: null
    });
  });

  test('renders change status button', () => {
    render(
      <StatusChangeControl
        dealId="123"
        currentStatus="active"
        allowedStatuses={['pending', 'completed', 'cancelled']}
      />
    );
    
    expect(screen.getByText('Change Status')).toBeInTheDocument();
  });

  test('shows dropdown when button is clicked', () => {
    render(
      <StatusChangeControl
        dealId="123"
        currentStatus="active"
        allowedStatuses={['pending', 'completed', 'cancelled']}
      />
    );
    
    // Initially, the dropdown is not shown
    expect(screen.queryByText('Select New Status:')).not.toBeInTheDocument();
    
    // Click the button
    fireEvent.click(screen.getByText('Change Status'));
    
    // Now the dropdown should be shown
    expect(screen.getByText('Select New Status:')).toBeInTheDocument();
    
    // All allowed statuses should be in the dropdown
    const select = screen.getByRole('combobox');
    expect(select).toHaveDisplayValue('Active'); // Current status is the initial value
    
    // Change the selection
    fireEvent.change(select, { target: { value: 'pending' } });
    expect(select).toHaveDisplayValue('Pending');
  });

  test('apply button calls update function with selected status', async () => {
    const onStatusUpdatedMock = vi.fn();

    render(
      <StatusChangeControl
        dealId="123"
        currentStatus="active"
        allowedStatuses={['pending', 'completed', 'cancelled']}
        onStatusUpdated={onStatusUpdatedMock}
      />
    );
    
    // Open dropdown
    fireEvent.click(screen.getByText('Change Status'));
    
    // Change status
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pending' } });
    
    // Click Apply
    fireEvent.click(screen.getByText('Apply'));
    
    // Verify that supabase.rpc was called with the correct arguments
    expect(supabase.rpc).toHaveBeenCalledWith('update_deal_status', {
      p_deal_id: '123',
      p_new_status: 'pending'
    });
    
    // Wait for the onStatusUpdated callback to be called
    await waitFor(() => {
      expect(onStatusUpdatedMock).toHaveBeenCalled();
    });
  });

  test('handles error when update fails', async () => {
    // Mock an error response from supabase
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: {
        message: 'Permission denied: Invalid status transition',
        details: '',
        hint: '',
        code: ''
      }
    });

    render(
      <StatusChangeControl
        dealId="123"
        currentStatus="active"
        allowedStatuses={['pending', 'completed', 'cancelled']}
      />
    );
    
    // Open dropdown and submit
    fireEvent.click(screen.getByText('Change Status'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pending' } });
    fireEvent.click(screen.getByText('Apply'));
    
    // Should show error state (loading indicator goes away)
    await waitFor(() => {
      expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
    });
  });

  test('apply button is disabled when no status change', () => {
    render(
      <StatusChangeControl
        dealId="123"
        currentStatus="active"
        allowedStatuses={['active', 'pending', 'cancelled']}
      />
    );
    
    // Open dropdown
    fireEvent.click(screen.getByText('Change Status'));
    
    // Initially, Apply should be disabled because we haven't changed from the current status
    expect(screen.getByText('Apply')).toBeDisabled();
    
    // Change to a different status
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pending' } });
    
    // Now Apply should be enabled
    expect(screen.getByText('Apply')).not.toBeDisabled();
    
    // Change back to the current status
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'active' } });
    
    // Apply should be disabled again
    expect(screen.getByText('Apply')).toBeDisabled();
  });
});
