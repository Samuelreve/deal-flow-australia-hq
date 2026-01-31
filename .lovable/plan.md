

# Plan: Remove Test Files and Fix Edge Function Errors

## Part 1: Remove Test Files (To Fix Test-Related Build Errors)

Delete the following files and directories:

### Test Utilities & Setup
- `src/test/utils.ts`
- `src/test/setup.ts`
- `src/test/mocks/providers.tsx`
- `src/test/mocks/supabase.ts`
- `src/test/mocks/` (entire directory)
- `src/test/` (entire directory after above deletions)

### Unit Test Files
- `src/lib/__tests__/sanitize.test.ts`
- `src/lib/__tests__/formatBytes.test.ts`
- `src/lib/__tests__/utils.test.ts`
- `src/lib/__tests__/` (entire directory)
- `src/services/__tests__/authService.test.ts`
- `src/services/__tests__/dealsService.test.ts`
- `src/services/__tests__/` (entire directory)

### Optional: Remove Test Config
- `vitest.config.ts` (if exists and no longer needed)
- Remove test-related devDependencies from `package.json` (optional):
  - `@testing-library/dom`
  - `@testing-library/jest-dom`
  - `@testing-library/react`
  - `@testing-library/user-event`
  - `jsdom`
  - `vitest`

---

## Part 2: Fix Edge Function TypeScript Errors

These are separate from tests but also causing build failures. Fix the `'error' is of type 'unknown'` errors by properly typing catch block errors.

### Files to Fix:

**1. `supabase/functions/docusign-oauth/index.ts`** (4 locations)
- Line 92: Change `error.message` to `(error instanceof Error ? error.message : 'An unexpected error occurred')`
- Line 256: Same fix
- Line 350: Same fix
- Line 404: Same fix

**2. `supabase/functions/remove-participant/index.ts`** (1 location)
- Line 176: Change `error.message` to `(error instanceof Error ? error.message : 'An unexpected error occurred')`

**3. `supabase/functions/invite-participant/invitation-handler.ts`** (1 location)
- Line 151: Change `emailError.message` to `(emailError instanceof Error ? emailError.message : 'Unknown email error')`

**4. `supabase/functions/public-ai-analyzer/index.ts`** (1 location)
- Line 108: Change `error.message` to `(error instanceof Error ? error.message : 'Unknown error')`

---

## Summary

| Action | Files Affected |
|--------|----------------|
| Delete test directories | `src/test/`, `src/lib/__tests__/`, `src/services/__tests__/` |
| Fix error typing | 4 edge function files (7 total locations) |
| Redeploy | `docusign-oauth`, `remove-participant`, `invite-participant`, `public-ai-analyzer` |

This will resolve all 30+ build errors currently showing.

