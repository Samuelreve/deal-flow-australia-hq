
import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { afterEach, beforeEach, describe, it } from "https://deno.land/std@0.192.0/testing/bdd.ts";
import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import { mockSupabase } from "./setup.ts";

// Mock the milestone-rbac.ts module
import { 
  getUserDealRole, 
  checkDealAllowsMilestoneOperations,
  isValidStatusTransition
} from "../_shared/milestone-rbac.ts";

// Import the module to test
import { 
  canUpdateMilestone,
  canDeleteMilestone
} from "../_shared/milestone-authorization.ts";

// Mock the imported functions
const mockGetUserDealRole = getUserDealRole as unknown as jest.Mock;
const mockCheckDealAllows = checkDealAllowsMilestoneOperations as unknown as jest.Mock;
const mockIsValidTransition = isValidStatusTransition as unknown as jest.Mock;

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

describe("canUpdateMilestone", () => {
  it("should allow update for users with admin role", async () => {
    // Mock the required functions
    mf.mock("POST@/rest/v1/deal_participants@", (req) => {
      return new Response(JSON.stringify({ 
        data: { role: "admin" }, 
        error: null 
      }), { status: 200 });
    });

    mf.mock("POST@/rest/v1/deals@", (req) => {
      return new Response(JSON.stringify({ 
        data: { status: "active" }, 
        error: null 
      }), { status: 200 });
    });

    const result = await canUpdateMilestone(
      "test-user-id",
      "test-milestone-id",
      "test-deal-id",
      "completed",
      "in_progress"
    );

    assertEquals(result.canUpdate, true);
  });

  it("should deny update for users with inappropriate role", async () => {
    // Mock getUserDealRole to return a role that cannot update
    mf.mock("POST@/rest/v1/deal_participants@", (req) => {
      return new Response(JSON.stringify({ 
        data: { role: "viewer" }, 
        error: null 
      }), { status: 200 });
    });

    const result = await canUpdateMilestone(
      "test-user-id",
      "test-milestone-id",
      "test-deal-id"
    );

    assertEquals(result.canUpdate, false);
    assertEquals(result.reason?.includes("Role 'viewer' cannot update milestones"), true);
  });

  it("should deny update when deal status doesn't allow it", async () => {
    // Mock getUserDealRole to return a valid role
    mf.mock("POST@/rest/v1/deal_participants@", (req) => {
      return new Response(JSON.stringify({ 
        data: { role: "seller" }, 
        error: null 
      }), { status: 200 });
    });

    // Mock checkDealAllowsMilestoneOperations to return false
    mf.mock("POST@/rest/v1/deals@", (req) => {
      return new Response(JSON.stringify({ 
        data: { status: "completed" }, 
        error: null 
      }), { status: 200 });
    });

    const result = await canUpdateMilestone(
      "test-user-id",
      "test-milestone-id",
      "test-deal-id"
    );

    assertEquals(result.canUpdate, false);
    assertEquals(result.reason?.includes("Deal status 'completed' does not allow milestone updates"), true);
  });

  it("should deny invalid status transitions", async () => {
    // Mock getUserDealRole to return a valid role
    mf.mock("POST@/rest/v1/deal_participants@", (req) => {
      return new Response(JSON.stringify({ 
        data: { role: "seller" }, 
        error: null 
      }), { status: 200 });
    });

    // Mock deal status to allow operations
    mf.mock("POST@/rest/v1/deals@", (req) => {
      return new Response(JSON.stringify({ 
        data: { status: "active" }, 
        error: null 
      }), { status: 200 });
    });

    // Override isValidStatusTransition for this test
    globalThis.isValidStatusTransition = (current: string, newStatus: string, role: string) => {
      return false;
    };

    const result = await canUpdateMilestone(
      "test-user-id",
      "test-milestone-id",
      "test-deal-id",
      "completed",
      "not_started"
    );

    assertEquals(result.canUpdate, false);
    assertEquals(result.reason?.includes("Cannot transition milestone"), true);
  });
});

describe("canDeleteMilestone", () => {
  it("should allow deletion for admin", async () => {
    // Mock getUserDealRole to return admin
    mf.mock("POST@/rest/v1/deal_participants@", (req) => {
      return new Response(JSON.stringify({ 
        data: { role: "admin" }, 
        error: null 
      }), { status: 200 });
    });

    // Mock deal status to allow operations
    mf.mock("POST@/rest/v1/deals@", (req) => {
      return new Response(JSON.stringify({ 
        data: { status: "active" }, 
        error: null 
      }), { status: 200 });
    });

    const result = await canDeleteMilestone(
      "test-user-id",
      "test-milestone-id",
      "test-deal-id",
      "not_started"
    );

    assertEquals(result.canDelete, true);
  });

  it("should deny deletion for inappropriate roles", async () => {
    // Mock getUserDealRole to return an inappropriate role
    mf.mock("POST@/rest/v1/deal_participants@", (req) => {
      return new Response(JSON.stringify({ 
        data: { role: "lawyer" }, 
        error: null 
      }), { status: 200 });
    });

    const result = await canDeleteMilestone(
      "test-user-id",
      "test-milestone-id",
      "test-deal-id"
    );

    assertEquals(result.canDelete, false);
    assertEquals(result.reason?.includes("Role 'lawyer' cannot delete milestones"), true);
  });

  it("should deny deletion for milestones that are not in not_started or blocked status", async () => {
    // Mock getUserDealRole to return a valid role
    mf.mock("POST@/rest/v1/deal_participants@", (req) => {
      return new Response(JSON.stringify({ 
        data: { role: "seller" }, 
        error: null 
      }), { status: 200 });
    });

    // Mock deal status to allow operations
    mf.mock("POST@/rest/v1/deals@", (req) => {
      return new Response(JSON.stringify({ 
        data: { status: "active" }, 
        error: null 
      }), { status: 200 });
    });

    const result = await canDeleteMilestone(
      "test-user-id",
      "test-milestone-id",
      "test-deal-id",
      "completed"
    );

    assertEquals(result.canDelete, false);
    assertEquals(result.reason?.includes("Cannot delete milestone with status 'completed'"), true);
  });
});
