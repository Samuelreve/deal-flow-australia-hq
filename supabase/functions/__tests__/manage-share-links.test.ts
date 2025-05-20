
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createMockRequest } from './setup.ts';

describe('manage-share-links edge function', () => {
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
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: {}, error: null })
            })
          })
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ 
                data: { 
                  id: 'test-share-link-id',
                  is_active: false
                }, 
                error: null 
              })
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
  
  it('should handle OPTIONS requests for CORS preflight', async () => {
    const mod = await import('../manage-share-links/index.ts');
    const handler = mod.handler; // Assuming this is how your function is exported
    
    const request = createMockRequest('OPTIONS', 'https://example.com/manage-share-links');
    const response = await handler(request);
    
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
  
  it('should reject requests without authorization header', async () => {
    const mod = await import('../manage-share-links/index.ts');
    const handler = mod.handler;
    
    const request = createMockRequest('GET', 'https://example.com/manage-share-links');
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(401);
    expect(responseBody.error).toContain('Missing authorization header');
  });
  
  it('should reject GET requests with invalid JSON', async () => {
    const mod = await import('../manage-share-links/index.ts');
    const handler = mod.handler;
    
    const request = new Request('https://example.com/manage-share-links', {
      method: 'GET',
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
  
  it('should reject GET requests without versionId', async () => {
    const mod = await import('../manage-share-links/index.ts');
    const handler = mod.handler;
    
    const request = createMockRequest('GET', 'https://example.com/manage-share-links', {
      // missing versionId
    }, {
      'Authorization': 'Bearer test-token'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(400);
    expect(responseBody.error).toContain('Missing versionId');
  });
  
  it('should successfully get share links with valid inputs', async () => {
    const mod = await import('../manage-share-links/index.ts');
    const handler = mod.handler;
    
    // Setup mock share links
    const mockLinks = [
      {
        id: 'link-1',
        token: 'token-1',
        is_active: true,
        expires_at: null,
        can_download: true,
        document_version_id: 'version-1',
        shared_by_user_id: 'user-1',
        created_at: '2023-01-01T00:00:00Z'
      },
      {
        id: 'link-2',
        token: 'token-2',
        is_active: false, // Revoked
        expires_at: null,
        can_download: false,
        document_version_id: 'version-1',
        shared_by_user_id: 'user-2',
        created_at: '2023-01-02T00:00:00Z'
      },
      {
        id: 'link-3',
        token: 'token-3',
        is_active: true,
        expires_at: '2000-01-01T00:00:00Z', // Expired
        can_download: true,
        document_version_id: 'version-1',
        shared_by_user_id: 'user-1',
        created_at: '2023-01-03T00:00:00Z'
      }
    ];
    
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
              single: () => Promise.resolve({ 
                data: { role: 'admin' }, // Admin role to see all links
                error: null 
              })
            })
          })
        };
      } else if (table === 'secure_share_links') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ 
              data: mockLinks, 
              error: null 
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
    
    const request = createMockRequest('GET', 'https://example.com/manage-share-links', {
      versionId: 'test-version-id'
    }, {
      'Authorization': 'Bearer test-token',
      'Origin': 'https://app.example.com'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(200);
    expect(responseBody.success).toBe(true);
    expect(responseBody.links).toBeDefined();
    expect(responseBody.links.length).toBe(3);
    
    // Check status mapping
    expect(responseBody.links[0].status).toBe('active');
    expect(responseBody.links[1].status).toBe('revoked');
    expect(responseBody.links[2].status).toBe('expired');
    
    // Check URL construction
    expect(responseBody.links[0].share_url).toContain('/share/token-1');
  });
  
  it('should handle authorization errors for GET', async () => {
    const mod = await import('../manage-share-links/index.ts');
    const handler = mod.handler;
    
    // Mock user is not a participant
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
              single: () => Promise.resolve({ 
                data: null, 
                error: { message: 'No rows found' } 
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
    
    const request = createMockRequest('GET', 'https://example.com/manage-share-links', {
      versionId: 'test-version-id'
    }, {
      'Authorization': 'Bearer test-token'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(403);
    expect(responseBody.error).toContain('not authorized');
  });
  
  it('should reject POST requests without linkId', async () => {
    const mod = await import('../manage-share-links/index.ts');
    const handler = mod.handler;
    
    const request = createMockRequest('POST', 'https://example.com/manage-share-links', {
      // missing linkId
    }, {
      'Authorization': 'Bearer test-token'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(400);
    expect(responseBody.error).toContain('Missing linkId');
  });
  
  it('should successfully revoke a share link with valid inputs', async () => {
    const mod = await import('../manage-share-links/index.ts');
    const handler = mod.handler;
    
    // Mock Supabase responses for this specific test
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'secure_share_links') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { 
                  id: 'test-link-id', 
                  document_version_id: 'test-version-id',
                  shared_by_user_id: 'test-user-id' // Same as authenticated user
                }, 
                error: null 
              })
            })
          }),
          update: () => ({
            eq: () => ({
              select: () => ({
                single: () => Promise.resolve({ 
                  data: { 
                    id: 'test-link-id',
                    is_active: false
                  }, 
                  error: null 
                })
              })
            })
          })
        };
      } else if (table === 'document_versions') {
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
              single: () => Promise.resolve({ 
                data: { role: 'seller' }, 
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
    
    const request = createMockRequest('POST', 'https://example.com/manage-share-links', {
      linkId: 'test-link-id'
    }, {
      'Authorization': 'Bearer test-token'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(200);
    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toContain('revoked successfully');
    expect(responseBody.link).toBeDefined();
    expect(responseBody.link.is_active).toBe(false);
    
    // Verify update was called
    expect(mockSupabase.from).toHaveBeenCalledWith('secure_share_links');
    expect(mockSupabase.from('secure_share_links').update).toHaveBeenCalledWith({ is_active: false });
  });
  
  it('should handle authorization errors for POST', async () => {
    const mod = await import('../manage-share-links/index.ts');
    const handler = mod.handler;
    
    // Mock Supabase responses - user trying to revoke someone else's link
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'secure_share_links') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { 
                  id: 'test-link-id', 
                  document_version_id: 'test-version-id',
                  shared_by_user_id: 'different-user-id' // Different from authenticated user
                }, 
                error: null 
              })
            })
          })
        };
      } else if (table === 'document_versions') {
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
              single: () => Promise.resolve({ 
                data: { role: 'seller' }, // Not admin, so can't revoke others' links
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
    
    const request = createMockRequest('POST', 'https://example.com/manage-share-links', {
      linkId: 'test-link-id'
    }, {
      'Authorization': 'Bearer test-token'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(403);
    expect(responseBody.error).toContain('do not have permission');
  });
  
  it('should handle share link not found', async () => {
    const mod = await import('../manage-share-links/index.ts');
    const handler = mod.handler;
    
    // Mock share link not found
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'secure_share_links') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: null, 
                error: { message: 'No rows found' } 
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
    
    const request = createMockRequest('POST', 'https://example.com/manage-share-links', {
      linkId: 'non-existent-link-id'
    }, {
      'Authorization': 'Bearer test-token'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(404);
    expect(responseBody.error).toContain('Share link not found');
  });
  
  it('should reject unsupported HTTP methods', async () => {
    const mod = await import('../manage-share-links/index.ts');
    const handler = mod.handler;
    
    const request = createMockRequest('PUT', 'https://example.com/manage-share-links', {
      linkId: 'test-link-id'
    }, {
      'Authorization': 'Bearer test-token'
    });
    
    const response = await handler(request);
    const responseBody = await response.json();
    
    expect(response.status).toBe(405);
    expect(responseBody.error).toContain('Method not allowed');
  });
});
