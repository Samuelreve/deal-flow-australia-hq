import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
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

  test("should fetch deals successfully", async () => {
    const { result } = renderHook(() => useDeals());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.deals.length).toBe(3);
    expect(result.current.deals[0].title).toBe("Test Deal 1");
  });

  test("should handle loading state", () => {
    const { result } = renderHook(() => useDeals());
    expect(result.current.loading).toBe(true);
  });
});
