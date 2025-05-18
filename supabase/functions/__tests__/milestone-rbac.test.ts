
import { assertEquals, assertNotEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { beforeEach, describe, it } from "https://deno.land/std@0.192.0/testing/bdd.ts";
import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import { mockSupabase } from "./setup.ts";

// Import the modules to test
import { 
  verifyMilestoneExists,
  isValidStatusTransition,
  checkDealAllowsMilestoneOperations,
  getUserDealRole
} from "../_shared/milestone-rbac.ts";

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
    // Mock supabase client to return no data
    mf.mock("POST@/rest/v1/milestones@", (req) => {
      return new Response(JSON.stringify({ data: null, error: { message: "Not found" } }), { status: 404 });
    });

    const result = await verifyMilestoneExists("non-existent-id");
    assertEquals(result.exists, false);
  });

  it("should return true with deal ID when milestone exists", async () => {
    // Mock supabase client to return milestone data
    mf.mock("POST@/rest/v1/milestones@", (req) => {
      return new Response(JSON.stringify({ 
        data: { id: "test-milestone", deal_id: "test-deal", status: "not_started" }, 
        error: null 
      }), { status: 200 });
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
    // Mock supabase client to return an active deal
    mf.mock("POST@/rest/v1/deals@", (req) => {
      return new Response(JSON.stringify({ 
        data: { id: "test-deal", status: "active" }, 
        error: null 
      }), { status: 200 });
    });

    const result = await checkDealAllowsMilestoneOperations("test-deal");
    assertEquals(result.allowsUpdate, true);
    assertEquals(result.allowsDelete, true);
    assertEquals(result.dealStatus, "active");
  });

  it("should not allow milestone deletion for completed deals", async () => {
    // Mock supabase client to return a completed deal
    mf.mock("POST@/rest/v1/deals@", (req) => {
      return new Response(JSON.stringify({ 
        data: { id: "test-deal", status: "completed" }, 
        error: null 
      }), { status: 200 });
    });

    const result = await checkDealAllowsMilestoneOperations("test-deal");
    assertEquals(result.allowsUpdate, false);
    assertEquals(result.allowsDelete, false);
    assertEquals(result.dealStatus, "completed");
  });
});

describe("getUserDealRole", () => {
  it("should return the user's role in the deal", async () => {
    // Mock supabase client to return user role
    mf.mock("POST@/rest/v1/deal_participants@", (req) => {
      return new Response(JSON.stringify({ 
        data: { user_id: "test-user", deal_id: "test-deal", role: "seller" }, 
        error: null 
      }), { status: 200 });
    });

    const role = await getUserDealRole("test-user", "test-deal");
    assertEquals(role, "seller");
  });

  it("should throw error when user is not in the deal", async () => {
    // Mock supabase client to return error
    mf.mock("POST@/rest/v1/deal_participants@", (req) => {
      return new Response(JSON.stringify({ 
        data: null, 
        error: { message: "User not found in deal" } 
      }), { status: 404 });
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
