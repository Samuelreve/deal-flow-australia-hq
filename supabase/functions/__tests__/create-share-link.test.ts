
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createMockRequest } from './setup.ts';

// Mock the auth module
vi.mock('../_shared/auth.ts', () => ({
  verifyAuth: vi.fn(),
}));

// Mock the email module
vi.mock('../_shared/email.ts', () => ({
  sendEmail: vi.fn(),
  generateShareLinkEmail: vi.fn(),
}));

// Import mocked modules
import { verifyAuth } from '../_shared/auth.ts';
import { sendEmail, generateShareLinkEmail } from '../_shared/email.ts';

// Mock crypto.getRandomValues
const mockGetRandomValues = vi.fn((arr) => {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = i % 256; // Simple deterministic value for testing
  }
  return arr;
});

// Setup global mock for crypto
const originalCrypto = global.crypto;
global.crypto = {
  ...originalCrypto,
  getRandomValues: mockGetRandomValues
};

describe('create-share-link edge function', () => {
  let mockSupabase: any;
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Setup mock Supabase methods
    mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null }),
            count: vi.fn().mockReturnValue({
              head: vi.fn().mockResolvedValue({ count: 1, error: null })
            })
          })
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: { 
                id: 'test-share-link-id',
                token: 'test-token',
                is_active: true,
                can_download: true
              }, 
              error: null 
            })
          })
        })
      }),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null
        })
      }
    };
    
    // Mock successful auth verification
    (verifyAuth as any).mockResolvedValue({ id: 'test-user-id' });
    
    // Mock successful email generation and sending
    (generateShareLinkEmail as any).mockReturnValue('<html>Test Email</html>');
    (sendEmail as any).mockResolvedValue({ success: true });
    
    // Override Deno.env.get to provide test values
    const mockEnv = {
      SUPABASE_URL: 'https://test-url.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key'
    };
    
    vi.stubGlobal('Deno', {
      ...globalThis.Deno,
      env: {
        get: (key: string) => mockEnv[key as keyof typeof mockEnv]
      }
    });
    
    // Mock the createClient function to return our mockSupabase
    vi.doMock('https://esm.sh/@supabase/supabase-js@2.21.0', async () => {
      return {
        createClient: () => mockSupabase
      };
    });
  });
  
  afterEach(() => {
    // Restore original crypto after tests
    global.crypto = originalCrypto;
  });
  
  it('should handle OPTIONS requests for CORS preflight', async () => {
    const mod = await import('../create-share-link/index.ts');
    const handler = mod.handler; // Assuming this is how your function is exported
    
    const request = createMockRequest('OPTIONS', 'https://example.com/create-share-link');
    const response = await handler(request);
    
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
  
  it('should reject requests without authorization header', async () => {
    const mod = await import('../create-share-link/index.ts');
    const handler = mod.handler;
    
    const request = createMockRequest('POST', 'https://example.com/create-share-link', {
      document_version_id: 'test-doc-version-id'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(401);
    expect(responseBody.error).toContain('Missing authorization header');
  });
  
  it('should reject requests with invalid JSON', async () => {
    const mod = await import('../create-share-link/index.ts');
    const handler = mod.handler;
    
    const request = new Request('https://example.com/create-share-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: 'not-valid-json'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(400);
    expect(responseBody.error).toContain('Invalid JSON');
  });
  
  it('should reject requests without document_version_id', async () => {
    const mod = await import('../create-share-link/index.ts');
    const handler = mod.handler;
    
    const request = createMockRequest('POST', 'https://example.com/create-share-link', {
      // missing document_version_id
      can_download: true
    }, {
      'Authorization': 'Bearer test-token'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(400);
    expect(responseBody.error).toContain('Missing required field: document_version_id');
  });
  
  it('should reject requests with invalid emails', async () => {
    const mod = await import('../create-share-link/index.ts');
    const handler = mod.handler;
    
    const request = createMockRequest('POST', 'https://example.com/create-share-link', {
      document_version_id: 'test-doc-version-id',
      recipients: ['valid@example.com', 'invalid-email', 'another@invalid']
    }, {
      'Authorization': 'Bearer test-token'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(400);
    expect(responseBody.error).toContain('Invalid email addresses');
  });
  
  it('should successfully create a share link with valid inputs', async () => {
    const mod = await import('../create-share-link/index.ts');
    const handler = mod.handler;
    
    // Mock Supabase responses for this specific test
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'document_versions') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { document_id: 'test-doc-id' }, 
                error: null 
              })
            })
          })
        };
      } else if (table === 'documents') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { deal_id: 'test-deal-id', name: 'Test Document' }, 
                error: null 
              })
            })
          })
        };
      } else if (table === 'deal_participants') {
        return {
          select: () => ({
            eq: () => ({
              count: () => ({
                head: () => Promise.resolve({ count: 1, error: null })
              })
            })
          })
        };
      } else if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { name: 'Test User' }, 
                error: null 
              })
            })
          })
        };
      } else if (table === 'deals') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { title: 'Test Deal' }, 
                error: null 
              })
            })
          })
        };
      } else if (table === 'secure_share_links') {
        return {
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({ 
                data: { 
                  id: 'test-share-link-id',
                  token: 'test-token',
                  is_active: true,
                  can_download: true
                }, 
                error: null 
              })
            })
          })
        };
      }
      
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: {}, error: null })
          })
        })
      };
    });
    
    const request = createMockRequest('POST', 'https://example.com/create-share-link', {
      document_version_id: 'test-doc-version-id',
      can_download: true,
      expires_at: new Date(Date.now() + 86400000).toISOString(), // 1 day in future
      recipients: ['test@example.com'],
      custom_message: 'Test custom message'
    }, {
      'Authorization': 'Bearer test-token',
      'Origin': 'https://app.example.com'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(201);
    expect(responseBody.success).toBe(true);
    expect(responseBody.data).toBeDefined();
    expect(responseBody.data.share_url).toBeDefined();
    expect(responseBody.email_results).toBeDefined();
    expect(responseBody.email_results.all_successful).toBe(true);
    
    // Verify email was sent
    expect(sendEmail).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: expect.stringContaining('Secure Document Shared')
      })
    );
    
    // Verify link was created in the database
    expect(mockSupabase.from).toHaveBeenCalledWith('secure_share_links');
    expect(mockSupabase.from('secure_share_links').insert).toHaveBeenCalledWith(
      expect.objectContaining({
        document_version_id: 'test-doc-version-id',
        shared_by_user_id: 'test-user-id',
        can_download: true
      })
    );
  });
  
  it('should handle authentication errors', async () => {
    const mod = await import('../create-share-link/index.ts');
    const handler = mod.handler;
    
    // Mock authentication failure
    (verifyAuth as any).mockRejectedValue(new Error('Invalid token'));
    
    const request = createMockRequest('POST', 'https://example.com/create-share-link', {
      document_version_id: 'test-doc-version-id'
    }, {
      'Authorization': 'Bearer invalid-token'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(401);
    expect(responseBody.error).toContain('Authentication failed');
  });
  
  it('should handle authorization errors', async () => {
    const mod = await import('../create-share-link/index.ts');
    const handler = mod.handler;
    
    // Mock participant check failure
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'document_versions') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { document_id: 'test-doc-id' }, 
                error: null 
              })
            })
          })
        };
      } else if (table === 'documents') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { deal_id: 'test-deal-id' }, 
                error: null 
              })
            })
          })
        };
      } else if (table === 'deal_participants') {
        return {
          select: () => ({
            eq: () => ({
              count: () => ({
                head: () => Promise.resolve({ count: 0, error: null }) // User is not a participant
              })
            })
          })
        };
      }
      
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: {}, error: null })
          })
        })
      };
    });
    
    const request = createMockRequest('POST', 'https://example.com/create-share-link', {
      document_version_id: 'test-doc-version-id'
    }, {
      'Authorization': 'Bearer test-token'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(403);
    expect(responseBody.error).toContain('not a participant');
  });
  
  it('should handle database errors when creating share link', async () => {
    const mod = await import('../create-share-link/index.ts');
    const handler = mod.handler;
    
    // Setup all checks to pass but fail at inserting the share link
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'document_versions') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { document_id: 'test-doc-id' }, 
                error: null 
              })
            })
          })
        };
      } else if (table === 'documents') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { deal_id: 'test-deal-id', name: 'Test Document' }, 
                error: null 
              })
            })
          })
        };
      } else if (table === 'deal_participants') {
        return {
          select: () => ({
            eq: () => ({
              count: () => ({
                head: () => Promise.resolve({ count: 1, error: null })
              })
            })
          })
        };
      } else if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { name: 'Test User' }, 
                error: null 
              })
            })
          })
        };
      } else if (table === 'deals') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { title: 'Test Deal' }, 
                error: null 
              })
            })
          })
        };
      } else if (table === 'secure_share_links') {
        return {
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({ 
                data: null, 
                error: { message: 'Database error', code: 'PGRST301' } 
              })
            })
          })
        };
      }
      
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: {}, error: null })
          })
        })
      };
    });
    
    const request = createMockRequest('POST', 'https://example.com/create-share-link', {
      document_version_id: 'test-doc-version-id'
    }, {
      'Authorization': 'Bearer test-token'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(500);
    expect(responseBody.error).toContain('Database error');
  });
});
