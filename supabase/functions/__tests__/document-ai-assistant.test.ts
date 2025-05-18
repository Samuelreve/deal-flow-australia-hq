
import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { beforeEach, describe, it } from "https://deno.land/std@0.192.0/testing/bdd.ts";
import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import { createMockRequest, mockOpenAI } from "./setup.ts";

// Import the request handler to test
import { handleRequest } from "../document-ai-assistant/request-handler.ts";

// Mock RBAC verification
import { verifyDealParticipant } from "../_shared/rbac.ts";
const mockVerifyDealParticipant = verifyDealParticipant as unknown as jest.Mock;

// Initialize test environment
beforeEach(() => {
  mf.install();
  
  // Mock verifyDealParticipant to succeed by default
  mockVerifyDealParticipant.mockImplementation(() => Promise.resolve(true));
});

// Clean up after tests
afterEach(() => {
  mf.uninstall();
});

describe("handleRequest", () => {
  it("should reject requests with missing required fields", async () => {
    const mockReq = createMockRequest(
      "POST", 
      "http://localhost/document-ai-assistant", 
      { operation: "explain_clause" } // Missing dealId and userId
    );
    
    const response = await handleRequest(mockReq, mockOpenAI);
    const responseData = await response.json();
    
    assertEquals(response.status, 400);
    assertEquals(responseData.error, "Missing required fields");
  });
  
  it("should reject requests from users not in the deal", async () => {
    // Mock verifyDealParticipant to throw an authorization error
    mockVerifyDealParticipant.mockImplementation(() => {
      throw new Error("Authorization error: User is not a deal participant");
    });
    
    const mockReq = createMockRequest(
      "POST", 
      "http://localhost/document-ai-assistant", 
      { 
        operation: "explain_clause", 
        dealId: "test-deal-id",
        userId: "test-user-id",
        content: "Test content"
      }
    );
    
    const response = await handleRequest(mockReq, mockOpenAI);
    const responseData = await response.json();
    
    assertEquals(response.status, 403);
    assertEquals(responseData.error, "Authorization error");
  });

  it("should handle explain_clause operation", async () => {
    const mockReq = createMockRequest(
      "POST", 
      "http://localhost/document-ai-assistant", 
      { 
        operation: "explain_clause", 
        dealId: "test-deal-id",
        userId: "test-user-id",
        content: "This clause states that the buyer agrees to purchase the property as-is."
      }
    );
    
    const response = await handleRequest(mockReq, mockOpenAI);
    const responseData = await response.json();
    
    assertEquals(response.status, 200);
    assertEquals(responseData.success, true);
    assertEquals(typeof responseData.explanation, "string");
    assertEquals(typeof responseData.disclaimer, "string");
  });

  it("should handle explain_milestone operation", async () => {
    // Mock the milestone data fetch
    mf.mock("POST@/rest/v1/milestones@", (req) => {
      return new Response(JSON.stringify({ 
        data: { 
          title: "Due Diligence", 
          description: "Complete all due diligence activities",
          status: "in_progress",
          deal_id: "test-deal-id"
        }, 
        error: null 
      }), { status: 200 });
    });
    
    const mockReq = createMockRequest(
      "POST", 
      "http://localhost/document-ai-assistant", 
      { 
        operation: "explain_milestone", 
        dealId: "test-deal-id",
        userId: "test-user-id",
        milestoneId: "test-milestone-id"
      }
    );
    
    const response = await handleRequest(mockReq, mockOpenAI);
    const responseData = await response.json();
    
    assertEquals(response.status, 200);
    assertEquals(responseData.success, true);
    assertEquals(typeof responseData.explanation, "string");
    assertEquals(responseData.milestone.title, "Due Diligence");
  });

  it("should handle suggest_next_action operation", async () => {
    // Mock the deal data fetch
    mf.mock("POST@/rest/v1/deals@", (req) => {
      return new Response(JSON.stringify({ 
        data: { status: "active" }, 
        error: null 
      }), { status: 200 });
    });
    
    // Mock the milestones data fetch
    mf.mock("POST@/rest/v1/milestones@", (req) => {
      return new Response(JSON.stringify({ 
        data: [
          { title: "Milestone 1", status: "completed", order_index: 1 },
          { title: "Milestone 2", status: "in_progress", order_index: 2 },
          { title: "Milestone 3", status: "not_started", order_index: 3 }
        ], 
        error: null 
      }), { status: 200 });
    });
    
    const mockReq = createMockRequest(
      "POST", 
      "http://localhost/document-ai-assistant", 
      { 
        operation: "suggest_next_action", 
        dealId: "test-deal-id",
        userId: "test-user-id"
      }
    );
    
    const response = await handleRequest(mockReq, mockOpenAI);
    const responseData = await response.json();
    
    assertEquals(response.status, 200);
    assertEquals(responseData.success, true);
    assertEquals(typeof responseData.suggestion, "string");
    assertEquals(responseData.dealStatus, "active");
  });

  it("should reject invalid operations", async () => {
    const mockReq = createMockRequest(
      "POST", 
      "http://localhost/document-ai-assistant", 
      { 
        operation: "invalid_operation", 
        dealId: "test-deal-id",
        userId: "test-user-id",
        content: "Test content"
      }
    );
    
    const response = await handleRequest(mockReq, mockOpenAI);
    const responseData = await response.json();
    
    assertEquals(response.status, 400);
    assertEquals(responseData.error, "Invalid operation type");
  });
});
