
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

describe("useDeals hook - Metrics", () => {
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

  test("should calculate metrics correctly", async () => {
    const { result } = renderHook(() => useDeals());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Check metrics
    expect(result.current.metrics.total).toBe(3);
    expect(result.current.metrics.active).toBe(1);
    expect(result.current.metrics.completed).toBe(1);
    expect(result.current.metrics.draft).toBe(1);
    
    // Check average health score calculation
    expect(result.current.metrics.averageHealthScore).toBe(68); // (75 + 100 + 30) / 3 = 68.33, rounded to 68
  });
});
