// Test helpers and mock setup

export const createMockRequest = (method: string, url: string, body: Record<string, unknown> = {}) => {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
};

export const mockOpenAI = {
  chat: {
    completions: {
      create: async () => ({
        choices: [{
          message: {
            content: "This is a mock OpenAI response for testing purposes."
          }
        }]
      })
    }
  }
};

// Mock Supabase client for testing
export const mockSupabase = {
  auth: {
    getUser: async () => ({ 
      data: { user: { id: 'test-user-id', email: 'test@example.com' } }, 
      error: null 
    }),
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: unknown) => ({
        single: async () => ({ 
          data: { id: 'test-id', user_id: 'test-user-id', role: 'admin' }, 
          error: null 
        }),
        maybeSingle: async () => ({ 
          data: { id: 'test-id', user_id: 'test-user-id', role: 'admin' }, 
          error: null 
        }),
      }),
      in: (column: string, values: unknown[]) => ({
        data: [],
        error: null,
      }),
    }),
    insert: (data: unknown) => ({
      select: () => ({
        single: async () => ({ data: { id: 'new-id', ...data as object }, error: null }),
      }),
    }),
    update: (data: unknown) => ({
      eq: (column: string, value: unknown) => ({
        select: () => ({
          single: async () => ({ data: { id: value, ...data as object }, error: null }),
        }),
      }),
    }),
    delete: () => ({
      eq: (column: string, value: unknown) => ({ error: null }),
    }),
  }),
};
