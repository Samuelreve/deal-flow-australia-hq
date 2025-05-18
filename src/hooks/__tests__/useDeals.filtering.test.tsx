
import { renderHook, waitFor } from "@testing-library/react";
import { useDeals } from "../useDeals";
import { supabase } from "@/integrations/supabase/client";
import { mockDeals, mockSupabaseDeals, setupMocks } from "./utils/testUtils";
import { vi, describe, beforeEach, test, expect } from "vitest";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
  },
}));

describe("useDeals hook - Filtering", () => {
  beforeEach(() => {
    setupMocks();
    
    // Setup the mock implementation for Supabase
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockResolvedValue({
        data: mockSupabaseDeals,
        error: null
      })
    }));
  });

  test("should filter deals by status", async () => {
    const { result } = renderHook(() => useDeals("user123"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Initially all deals are shown
    expect(result.current.filteredDeals.length).toBe(3);
    
    // Filter by active status
    result.current.setStatusFilter("active");
    
    // Should now only show active deals
    expect(result.current.filteredDeals.length).toBe(1);
    expect(result.current.filteredDeals[0].status).toBe("active");
    
    // Filter by completed status
    result.current.setStatusFilter("completed");
    
    // Should now only show completed deals
    expect(result.current.filteredDeals.length).toBe(1);
    expect(result.current.filteredDeals[0].status).toBe("completed");
    
    // Filter by draft status
    result.current.setStatusFilter("draft");
    
    // Should now only show draft deals
    expect(result.current.filteredDeals.length).toBe(1);
    expect(result.current.filteredDeals[0].status).toBe("draft");
    
    // Reset filter to all
    result.current.setStatusFilter("all");
    
    // Should show all deals again
    expect(result.current.filteredDeals.length).toBe(3);
  });
  
  test("should filter deals by search term", async () => {
    const { result } = renderHook(() => useDeals("user123"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Initially all deals are shown
    expect(result.current.filteredDeals.length).toBe(3);
    
    // Search by title
    result.current.setSearchTerm("Draft");
    
    // Should only show deals with "Draft" in the title
    expect(result.current.filteredDeals.length).toBe(1);
    expect(result.current.filteredDeals[0].title).toBe("Test Draft Deal");
    
    // Search by seller name (case insensitive)
    result.current.setSearchTerm("seller");
    
    // Should show all deals with "Seller" in the seller name
    expect(result.current.filteredDeals.length).toBe(3);
    
    // Search with no matches
    result.current.setSearchTerm("nonexistent");
    
    // Should show no deals
    expect(result.current.filteredDeals.length).toBe(0);
    
    // Clear search
    result.current.setSearchTerm("");
    
    // Should show all deals again
    expect(result.current.filteredDeals.length).toBe(3);
  });
});
