
# Edge Functions Tests

This directory contains tests for the Edge Functions and shared modules.

## Running Tests

To run the tests locally, you'll need to have Deno installed. Then you can run:

```bash
# From the supabase/functions directory
deno test --allow-env --allow-net --allow-read __tests__/*.test.ts
```

Or if you want to run a specific test file:

```bash
deno test --allow-env --allow-net --allow-read __tests__/milestone-rbac.test.ts
```

## Test Structure

The tests are organized by module:

- `milestone-rbac.test.ts`: Tests for the milestone RBAC module
- `milestone-authorization.test.ts`: Tests for milestone authorization functions
- `document-ai-assistant.test.ts`: Integration tests for the document-ai-assistant Edge Function
- `ai-operations.test.ts`: Tests for individual AI operations

## Mock Strategy

Tests use the following mock strategies:

1. Mock HTTP requests using `mock_fetch`
2. Mock Supabase client responses
3. Mock OpenAI API responses

## Environment Variables

For local testing, create a `.env` file in the `supabase/functions` directory with:

```
SUPABASE_URL=https://example.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-test-key
OPENAI_API_KEY=your-test-key
```

When running in CI, these variables are set automatically.
