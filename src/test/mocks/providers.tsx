/**
 * Test providers wrapper for rendering components in tests
 */
import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthContextType, User, UserProfile } from '@/types/auth';
import { vi } from 'vitest';

// Create a fresh QueryClient for each test
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Mock user for testing
export const mockTestUser: User = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'seller',
  profile: {
    id: 'test-user-id-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'seller',
    avatar_url: undefined,
    company: 'Test Company',
    phone: '+1234567890',
    is_professional: false,
    onboarding_complete: true,
  },
};

// Mock auth context
export const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: mockTestUser,
  session: {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
    user: {
      id: 'test-user-id-123',
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
      app_metadata: {},
      user_metadata: { name: 'Test User' },
      aud: 'authenticated',
      role: 'authenticated',
    },
  },
  isAuthenticated: true,
  loading: false,
  login: vi.fn().mockResolvedValue(true),
  logout: vi.fn(),
  signup: vi.fn().mockResolvedValue(true),
  updateUserProfile: vi.fn().mockResolvedValue(true),
  setUser: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInWithApple: vi.fn(),
  ...overrides,
});

// Auth Context for testing
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

interface MockAuthProviderProps {
  children: ReactNode;
  value?: Partial<AuthContextType>;
}

export const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ children, value = {} }) => {
  const authContext = createMockAuthContext(value);
  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
};

// Export the context for useAuth hook
export { AuthContext };

// Test wrapper with all providers
interface TestWrapperProps {
  children: ReactNode;
  authOverrides?: Partial<AuthContextType>;
  queryClient?: QueryClient;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  authOverrides = {},
  queryClient = createTestQueryClient(),
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MockAuthProvider value={authOverrides}>{children}</MockAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Utility function to create wrapper for renderHook
export const createTestWrapper = (authOverrides: Partial<AuthContextType> = {}) => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <TestWrapper authOverrides={authOverrides} queryClient={queryClient}>
      {children}
    </TestWrapper>
  );
};
