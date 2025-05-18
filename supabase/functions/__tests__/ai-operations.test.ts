
import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { beforeEach, describe, it } from "https://deno.land/std@0.192.0/testing/bdd.ts";
import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import { mockOpenAI } from "./setup.ts";

// Import the operations to test
import { handleExplainClause } from "../document-ai-assistant/operations/explain-clause.ts";
import { handleExplainMilestone } from "../document-ai-assistant/operations/explain-milestone.ts";
import { handleSuggestNextAction } from "../document-ai-assistant/operations/suggest-next-action.ts";
import { handleSummarizeDocument } from "../document-ai-assistant/operations/summarize-document.ts";
import { handleGenerateTemplate } from "../document-ai-assistant/operations/generate-template.ts";

// Initialize test environment
beforeEach(() => {
  mf.install();
  
  // Mock getSupabaseAdmin to return our mock client
  globalThis.getSupabaseAdmin = () => ({
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: () => Promise.resolve({
            data: { 
              title: "Test Document",
              description: "Test description",
              status: "active"
            }, 
            error: null
          }),
          order: (column: string, options: { ascending: boolean }) => ({
            limit: (limit: number) => Promise.resolve({
              data: [
                { title: "Milestone 1", status: "completed", order_index: 1 },
                { title: "Milestone 2", status: "in_progress", order_index: 2 }
              ], 
              error: null
            })
          })
        }),
        order: (column: string, options: { ascending: boolean }) => ({
          limit: (limit: number) => Promise.resolve({
            data: [
              { title: "Milestone 1", status: "completed", order_index: 1 },
              { title: "Milestone 2", status: "in_progress", order_index: 2 }
            ], 
            error: null
          })
        })
      })
    }),
    storage: {
      from: (bucket: string) => ({
        download: (path: string) => Promise.resolve({ 
          data: new Blob(["test document content"]), 
          error: null 
        })
      })
    }
  });
});

// Clean up after tests
afterEach(() => {
  mf.uninstall();
});

describe("handleExplainClause", () => {
  it("should return explanation and disclaimer", async () => {
    const result = await handleExplainClause(
      "This clause states that the buyer must pay closing costs.", 
      {}, 
      mockOpenAI
    );
    
    assertEquals(typeof result.explanation, "string");
    assertEquals(typeof result.disclaimer, "string");
    assertEquals(result.disclaimer.includes("not be considered legal advice"), true);
  });
});

describe("handleExplainMilestone", () => {
  it("should return milestone explanation and details", async () => {
    const result = await handleExplainMilestone(
      "test-deal-id",
      "test-milestone-id",
      mockOpenAI
    );
    
    assertEquals(typeof result.explanation, "string");
    assertEquals(typeof result.milestone, "object");
    assertEquals(typeof result.milestone.title, "string");
    assertEquals(typeof result.milestone.status, "string");
    assertEquals(typeof result.disclaimer, "string");
  });
  
  it("should throw error when milestone ID is missing", async () => {
    try {
      await handleExplainMilestone(
        "test-deal-id",
        "", // Empty milestone ID
        mockOpenAI
      );
      assertEquals(true, false, "Expected an error but none was thrown");
    } catch (error) {
      assertEquals(error instanceof Error, true);
      assertEquals(error.message.includes("Milestone ID is required"), true);
    }
  });
});

describe("handleSuggestNextAction", () => {
  it("should return next action suggestion and deal status", async () => {
    const result = await handleSuggestNextAction(
      "test-deal-id",
      mockOpenAI
    );
    
    assertEquals(typeof result.suggestion, "string");
    assertEquals(typeof result.dealStatus, "string");
    assertEquals(typeof result.disclaimer, "string");
  });
});

describe("handleSummarizeDocument", () => {
  it("should summarize provided content", async () => {
    const result = await handleSummarizeDocument(
      "This is a test document content that should be summarized.",
      undefined,
      undefined,
      undefined,
      mockOpenAI
    );
    
    assertEquals(typeof result.summary, "string");
    assertEquals(typeof result.disclaimer, "string");
  });
  
  it("should throw error when no content is provided", async () => {
    try {
      await handleSummarizeDocument(
        "",
        "test-deal-id",
        "test-document-id",
        undefined,
        mockOpenAI
      );
      assertEquals(true, false, "Expected an error but none was thrown");
    } catch (error) {
      assertEquals(error instanceof Error, true);
    }
  });
});

describe("handleGenerateTemplate", () => {
  it("should generate document template", async () => {
    mf.mock("POST@/rest/v1/deal_participants@", (req) => {
      return new Response(JSON.stringify({ 
        data: { role: "admin" }, 
        error: null 
      }), { status: 200 });
    });
    
    const result = await handleGenerateTemplate(
      "Create a sales agreement template for a software product.",
      "test-deal-id",
      "test-user-id",
      "Agreement",
      { jurisdiction: "California" },
      mockOpenAI
    );
    
    assertEquals(typeof result.template, "string");
    assertEquals(typeof result.disclaimer, "string");
  });
  
  it("should throw error for unauthorized roles", async () => {
    mf.mock("POST@/rest/v1/deal_participants@", (req) => {
      return new Response(JSON.stringify({ 
        data: { role: "viewer" }, 
        error: null 
      }), { status: 200 });
    });
    
    try {
      await handleGenerateTemplate(
        "Create a sales agreement template.",
        "test-deal-id",
        "test-user-id",
        "Agreement",
        {},
        mockOpenAI
      );
      assertEquals(true, false, "Expected an error but none was thrown");
    } catch (error) {
      assertEquals(error instanceof Error, true);
      assertEquals(error.message.includes("not authorized"), true);
    }
  });
});
