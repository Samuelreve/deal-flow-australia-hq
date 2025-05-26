
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

describe("useDeals hook - Data Fetching", () => {
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

  test("should fetch and format deals correctly", async () => {
    // Mock the Supabase response
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockResolvedValue({
        data: mockSupabaseDeals,
        error: null
      })
    }));

    const { result } = renderHook(() => useDeals());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.deals.length).toBe(3);
    
    // Verify the formatting is correct
    expect(result.current.deals[0].id).toBe("1");
    expect(result.current.deals[0].title).toBe("Test Deal 1");
    expect(result.current.deals[0].status).toBe("active");
    expect(result.current.deals[0].seller?.name).toBe("Seller Name");
  });
  
  test("should handle Supabase error correctly", async () => {
    // Mock Supabase to return an error
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" }
      })
    }));
    
    // Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    const { result } = renderHook(() => useDeals());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Check that error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to fetch deals:", { message: "Database error" });
    
    // Check that deals array is empty
    expect(result.current.deals).toEqual([]);
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});
