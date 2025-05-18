
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { load } from "https://deno.land/std@0.192.0/dotenv/mod.ts";

// Load environment variables from .env file for tests
await load({ export: true });

// Mock environment variables if they are not present
if (!Deno.env.get("SUPABASE_URL")) {
  Deno.env.set("SUPABASE_URL", "https://example.supabase.co");
}

if (!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
}

if (!Deno.env.get("OPENAI_API_KEY")) {
  Deno.env.set("OPENAI_API_KEY", "test-openai-api-key");
}

// Create a mock Supabase client for testing
export const mockSupabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: () => Promise.resolve({ data: {}, error: null }),
        limit: (limit: number) => Promise.resolve({ data: [], error: null }),
      }),
      filter: (column: string, operator: string, value: any) => ({
        limit: (limit: number) => Promise.resolve({ data: [], error: null }),
      }),
      order: (column: string, options: { ascending: boolean }) => ({
        limit: (limit: number) => Promise.resolve({ data: [], error: null }),
      }),
    }),
    insert: (values: any) => Promise.resolve({ data: values, error: null }),
    update: (values: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: values, error: null }),
    }),
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({ data: {}, error: null }),
    }),
  }),
  storage: {
    from: (bucket: string) => ({
      download: (path: string) => Promise.resolve({ data: new Blob(["test content"]), error: null }),
      remove: (paths: string[]) => Promise.resolve({ data: {}, error: null }),
    }),
  },
  auth: {
    getUser: (token: string) => Promise.resolve({ data: { user: { id: "test-user-id" } }, error: null }),
  },
};

// Mock OpenAI client
export const mockOpenAI = {
  chat: {
    completions: {
      create: async (params: any) => {
        return {
          choices: [
            {
              message: {
                content: "This is a test AI response.",
              },
            },
          ],
        };
      },
    },
  },
};

// Helper function to create a mock Request for testing edge functions
export function createMockRequest(
  method: string,
  url: string,
  body: any = null,
  headers: Record<string, string> = {}
): Request {
  const requestInit: RequestInit = {
    method,
    headers: new Headers({
      "Content-Type": "application/json",
      ...headers,
    }),
  };

  if (body && method !== "GET" && method !== "HEAD") {
    requestInit.body = JSON.stringify(body);
  }

  return new Request(new URL(url, "http://localhost"), requestInit);
}

// Mock fetch global for tests
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  return new Response(
    JSON.stringify({
      choices: [
        {
          message: {
            content: "Mocked OpenAI response",
          },
        },
      ],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
