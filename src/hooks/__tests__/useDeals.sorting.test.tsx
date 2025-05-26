
import React from 'react';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { useDeals } from '../useDeals';
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

  test("should return deals in default order", async () => {
    const { result } = renderHook(() => useDeals());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Check that deals are returned (sorting would be handled by components)
    expect(result.current.deals.length).toBe(3);
    expect(result.current.deals[0].title).toBe("Test Deal 1");
    expect(result.current.deals[1].title).toBe("Test Deal 2");
    expect(result.current.deals[2].title).toBe("Test Draft Deal");
  });
});
