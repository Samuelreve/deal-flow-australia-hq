
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

describe("useDeals hook - Sorting", () => {
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

  test("should sort deals by different fields", async () => {
    const { result } = renderHook(() => useDeals("user123"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Default sort is by updatedAt, descending
    
    // Sort by title ascending
    result.current.setSortBy("title");
    result.current.setSortOrder("asc");
    
    expect(result.current.filteredDeals[0].title).toBe("Test Deal 1");
    expect(result.current.filteredDeals[1].title).toBe("Test Deal 2");
    expect(result.current.filteredDeals[2].title).toBe("Test Draft Deal");
    
    // Sort by title descending
    result.current.setSortOrder("desc");
    
    expect(result.current.filteredDeals[0].title).toBe("Test Draft Deal");
    expect(result.current.filteredDeals[1].title).toBe("Test Deal 2");
    expect(result.current.filteredDeals[2].title).toBe("Test Deal 1");
    
    // Sort by health score ascending
    result.current.setSortBy("healthScore");
    result.current.setSortOrder("asc");
    
    expect(result.current.filteredDeals[0].healthScore).toBe(30); // Draft
    expect(result.current.filteredDeals[1].healthScore).toBe(75); // Deal 1
    expect(result.current.filteredDeals[2].healthScore).toBe(100); // Deal 2
    
    // Sort by health score descending
    result.current.setSortOrder("desc");
    
    expect(result.current.filteredDeals[0].healthScore).toBe(100); // Deal 2
    expect(result.current.filteredDeals[1].healthScore).toBe(75); // Deal 1
    expect(result.current.filteredDeals[2].healthScore).toBe(30); // Draft
  });
});
