
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDeals } from "../useDeals";
import { supabase } from "@/integrations/supabase/client";
import { DealSummary } from "@/types/deal";

// Mock Supabase client
jest.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
  },
}));

describe("useDeals hook", () => {
  // Sample mock data
  const mockDeals = [
    {
      id: "1",
      title: "Test Deal 1",
      status: "active",
      created_at: "2023-05-01T10:00:00Z",
      updated_at: "2023-05-10T15:30:00Z",
      health_score: 75,
      seller_id: "seller1",
      buyer_id: "buyer1",
      profiles: { name: "Seller Name" }
    },
    {
      id: "2",
      title: "Test Deal 2",
      status: "completed",
      created_at: "2023-04-01T10:00:00Z",
      updated_at: "2023-04-20T15:30:00Z",
      health_score: 100,
      seller_id: "seller1",
      buyer_id: "buyer2",
      profiles: { name: "Seller Name" }
    },
    {
      id: "3",
      title: "Test Draft Deal",
      status: "draft",
      created_at: "2023-06-01T10:00:00Z",
      updated_at: "2023-06-02T15:30:00Z",
      health_score: 30,
      seller_id: "seller1",
      buyer_id: null,
      profiles: { name: "Seller Name" }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup the mock implementation for Supabase
    (supabase.from as jest.Mock).mockReturnThis();
    (supabase.select as jest.Mock).mockReturnThis();
  });

  test("should return empty deals array when userId is not provided", async () => {
    const { result } = renderHook(() => useDeals(undefined));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.deals).toEqual([]);
    expect(result.current.filteredDeals).toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  test("should fetch and format deals correctly", async () => {
    // Mock the Supabase response
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        data: mockDeals,
        error: null
      })
    }));

    const { result } = renderHook(() => useDeals("user123"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.deals.length).toBe(3);
    expect(result.current.filteredDeals.length).toBe(3);
    
    // Verify the formatting is correct
    expect(result.current.deals[0].id).toBe("1");
    expect(result.current.deals[0].title).toBe("Test Deal 1");
    expect(result.current.deals[0].status).toBe("active");
    expect(result.current.deals[0].sellerName).toBe("Seller Name");
  });

  test("should handle filter by status correctly", async () => {
    // Mock the Supabase response
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        data: mockDeals,
        error: null
      })
    }));

    const { result } = renderHook(() => useDeals("user123"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Initially all deals should be shown
    expect(result.current.filteredDeals.length).toBe(3);
    
    // Filter by active status
    act(() => {
      result.current.setStatusFilter("active");
    });
    
    expect(result.current.statusFilter).toBe("active");
    expect(result.current.filteredDeals.length).toBe(1);
    expect(result.current.filteredDeals[0].status).toBe("active");
    
    // Filter by completed status
    act(() => {
      result.current.setStatusFilter("completed");
    });
    
    expect(result.current.filteredDeals.length).toBe(1);
    expect(result.current.filteredDeals[0].status).toBe("completed");
    
    // Filter by draft status
    act(() => {
      result.current.setStatusFilter("draft");
    });
    
    expect(result.current.filteredDeals.length).toBe(1);
    expect(result.current.filteredDeals[0].status).toBe("draft");
    
    // Reset to all
    act(() => {
      result.current.setStatusFilter("all");
    });
    
    expect(result.current.filteredDeals.length).toBe(3);
  });

  test("should handle search filter correctly", async () => {
    // Mock the Supabase response
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        data: mockDeals,
        error: null
      })
    }));

    const { result } = renderHook(() => useDeals("user123"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Search for "Test Deal 1"
    act(() => {
      result.current.setSearchTerm("Test Deal 1");
    });
    
    expect(result.current.searchTerm).toBe("Test Deal 1");
    expect(result.current.filteredDeals.length).toBe(1);
    expect(result.current.filteredDeals[0].title).toBe("Test Deal 1");
    
    // Search for "Draft" should return the draft deal
    act(() => {
      result.current.setSearchTerm("Draft");
    });
    
    expect(result.current.filteredDeals.length).toBe(1);
    expect(result.current.filteredDeals[0].title).toBe("Test Draft Deal");
    
    // Search for non-existent term
    act(() => {
      result.current.setSearchTerm("Nonexistent");
    });
    
    expect(result.current.filteredDeals.length).toBe(0);
    
    // Clear search
    act(() => {
      result.current.setSearchTerm("");
    });
    
    expect(result.current.filteredDeals.length).toBe(3);
  });

  test("should handle sort correctly", async () => {
    // Mock the Supabase response
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        data: mockDeals,
        error: null
      })
    }));

    const { result } = renderHook(() => useDeals("user123"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Sort by title ascending
    act(() => {
      result.current.setSortBy("title");
      result.current.setSortOrder("asc");
    });
    
    expect(result.current.filteredDeals[0].title).toBe("Test Deal 1");
    expect(result.current.filteredDeals[1].title).toBe("Test Deal 2");
    expect(result.current.filteredDeals[2].title).toBe("Test Draft Deal");
    
    // Sort by title descending
    act(() => {
      result.current.setSortOrder("desc");
    });
    
    expect(result.current.filteredDeals[0].title).toBe("Test Draft Deal");
    expect(result.current.filteredDeals[1].title).toBe("Test Deal 2");
    expect(result.current.filteredDeals[2].title).toBe("Test Deal 1");
    
    // Sort by health score ascending
    act(() => {
      result.current.setSortBy("healthScore");
      result.current.setSortOrder("asc");
    });
    
    expect(result.current.filteredDeals[0].healthScore).toBe(30);
    expect(result.current.filteredDeals[1].healthScore).toBe(75);
    expect(result.current.filteredDeals[2].healthScore).toBe(100);
  });

  test("should calculate metrics correctly", async () => {
    // Mock the Supabase response
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        data: mockDeals,
        error: null
      })
    }));

    const { result } = renderHook(() => useDeals("user123"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Check metrics
    expect(result.current.metrics.total).toBe(3);
    expect(result.current.metrics.active).toBe(1);
    expect(result.current.metrics.completed).toBe(1);
    expect(result.current.metrics.draft).toBe(1);
    
    // Check average health score of active deals
    expect(result.current.activeDeals.length).toBe(1);
    expect(result.current.averageHealthScore).toBe(75);
  });

  test("should handle Supabase error correctly", async () => {
    // Mock Supabase to return an error
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" }
      })
    }));
    
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    
    const { result } = renderHook(() => useDeals("user123"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Check that error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching deals:", { message: "Database error" });
    
    // Check that deals array is empty
    expect(result.current.deals).toEqual([]);
    expect(result.current.filteredDeals).toEqual([]);
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});
