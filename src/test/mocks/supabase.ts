/**
 * Comprehensive Supabase mock for testing
 */
import { vi } from 'vitest';

// Mock user data
export const mockUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: { name: 'Test User' },
  aud: 'authenticated',
  role: 'authenticated',
};

export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: mockUser,
};

export const mockProfile = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'seller' as const,
  avatar_url: null,
  company: 'Test Company',
  phone: '+1234567890',
  is_professional: false,
  onboarding_complete: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockDeal = {
  id: 'test-deal-id-123',
  title: 'Test Deal',
  description: 'A test deal for testing',
  status: 'active',
  health_score: 75,
  seller_id: 'test-user-id-123',
  buyer_id: 'buyer-id-456',
  asking_price: 100000,
  business_name: 'Test Business',
  business_industry: 'Technology',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  seller: { name: 'Test User' },
  buyer: { name: 'Buyer User' },
};

// Create chainable mock builder
const createQueryBuilder = (data: any = null, error: any = null) => {
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    then: (resolve: any) => resolve({ data, error, count: Array.isArray(data) ? data.length : 0 }),
  };
  return builder;
};

// Create mock Supabase client
export const createMockSupabaseClient = (overrides: any = {}) => {
  const mockClient = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: { url: 'https://oauth.example.com' }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
    from: vi.fn((table: string) => {
      // Return different data based on table
      switch (table) {
        case 'profiles':
          return createQueryBuilder(mockProfile);
        case 'deals':
          return createQueryBuilder([mockDeal]);
        case 'deal_participants':
          return createQueryBuilder([{ deal_id: 'test-deal-id-123', user_id: 'test-user-id-123', role: 'seller' }]);
        default:
          return createQueryBuilder([]);
      }
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test/path.pdf' }, error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(['test']), error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file.pdf' } }),
        remove: vi.fn().mockResolvedValue({ error: null }),
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    }),
    removeChannel: vi.fn(),
    ...overrides,
  };

  return mockClient;
};

// Default mock client
export const mockSupabaseClient = createMockSupabaseClient();

// Mock the supabase import
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));
