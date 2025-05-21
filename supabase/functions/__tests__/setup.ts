
// Test helpers and mock setup
export const createMockRequest = (method, url, body = {}) => {
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
