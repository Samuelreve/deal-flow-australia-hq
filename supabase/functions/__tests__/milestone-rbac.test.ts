
import { assertEquals, assertNotEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { afterEach, beforeEach, describe, it } from "https://deno.land/std@0.192.0/testing/bdd.ts";
import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import { mockSupabase } from "./setup.ts";

// Import the modules to test
import { 
  verifyMilestoneExists,
  isValidStatusTransition,
  checkDealAllowsMilestoneOperations,
  getUserDealRole
} from "../_shared/milestone-rbac.ts";

// Wrap all tests in a describe with sanitize options disabled
// to handle Supabase client internal timers
describe({ 
  name: "Milestone RBAC Tests",
  sanitizeResources: false,
  sanitizeOps: false,
}, () => {

// Initialize test environment
beforeEach(() => {
  mf.install();
  
  // Mock getSupabaseAdmin to return our mock client
  globalThis.getSupabaseAdmin = () => mockSupabase;
});

// Clean up after tests
afterEach(() => {
  mf.uninstall();
});

describe("verifyMilestoneExists", () => {
  it("should return false when milestone doesn't exist", async () => {
    // Mock supabase client GET request to return 406 error (no rows found for .single())
    mf.mock("GET@/rest/v1/milestones", () => {
      return new Response(JSON.stringify({
        code: "PGRST116",
        details: "Results contain 0 rows",
        hint: null,
        message: "JSON object requested, multiple (or no) rows returned"
      }), { 
        status: 406,
        headers: { "Content-Type": "application/json" }
      });
    });

    const result = await verifyMilestoneExists("non-existent-id");
    assertEquals(result.exists, false);
  });

  it("should return true with deal ID when milestone exists", async () => {
    // Mock supabase client GET request to return milestone data
    mf.mock("GET@/rest/v1/milestones", () => {
      return new Response(JSON.stringify({ 
        id: "test-milestone", 
        deal_id: "test-deal", 
        status: "not_started" 
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    });

    const result = await verifyMilestoneExists("test-milestone");
    assertEquals(result.exists, true);
    assertEquals(result.dealId, "test-deal");
    assertEquals(result.currentStatus, "not_started");
  });
});

describe("isValidStatusTransition", () => {
  it("should return true for valid status transitions", () => {
    // Test all valid transitions
    assertEquals(isValidStatusTransition("not_started", "in_progress", "seller"), true);
    assertEquals(isValidStatusTransition("not_started", "blocked", "seller"), true);
    assertEquals(isValidStatusTransition("in_progress", "completed", "seller"), true);
    assertEquals(isValidStatusTransition("in_progress", "blocked", "seller"), true);
    assertEquals(isValidStatusTransition("blocked", "in_progress", "seller"), true);
  });

  it("should return false for invalid transitions", () => {
    assertEquals(isValidStatusTransition("not_started", "completed", "seller"), false);
    assertEquals(isValidStatusTransition("blocked", "completed", "seller"), false);
  });

  it("should allow admin to reopen completed milestones", () => {
    assertEquals(isValidStatusTransition("completed", "in_progress", "admin"), true);
    assertEquals(isValidStatusTransition("completed", "in_progress", "seller"), false);
    assertEquals(isValidStatusTransition("completed", "in_progress", "buyer"), false);
  });
});

describe("checkDealAllowsMilestoneOperations", () => {
  it("should allow milestone operations for active deals", async () => {
    // Mock supabase client GET request to return an active deal
    mf.mock("GET@/rest/v1/deals", () => {
      return new Response(JSON.stringify({ 
        id: "test-deal", 
        status: "active" 
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    });

    const result = await checkDealAllowsMilestoneOperations("test-deal");
    assertEquals(result.allowsUpdate, true);
    assertEquals(result.allowsDelete, true);
    assertEquals(result.dealStatus, "active");
  });

  it("should not allow milestone deletion for completed deals", async () => {
    // Mock supabase client GET request to return a completed deal
    mf.mock("GET@/rest/v1/deals", () => {
      return new Response(JSON.stringify({ 
        id: "test-deal", 
        status: "completed" 
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    });

    const result = await checkDealAllowsMilestoneOperations("test-deal");
    assertEquals(result.allowsUpdate, false);
    assertEquals(result.allowsDelete, false);
    assertEquals(result.dealStatus, "completed");
  });
});

describe("getUserDealRole", () => {
  it("should return the user's role in the deal", async () => {
    // Mock supabase client GET request to return user role
    mf.mock("GET@/rest/v1/deal_participants", () => {
      return new Response(JSON.stringify({ 
        user_id: "test-user", 
        deal_id: "test-deal", 
        role: "seller" 
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    });

    const role = await getUserDealRole("test-user", "test-deal");
    assertEquals(role, "seller");
  });

  it("should throw error when user is not in the deal", async () => {
    // Mock supabase client GET request to return empty (not found)
    mf.mock("GET@/rest/v1/deal_participants", () => {
      return new Response(JSON.stringify(null), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    });

    try {
      await getUserDealRole("test-user", "test-deal");
      // If no error is thrown, fail the test
      assertEquals(true, false, "Expected an error but none was thrown");
    } catch (error) {
      assertEquals(error instanceof Error, true);
    }
  });
});

}); // End of outer describe block
