/**
 * Test utility functions
 */
import { vi } from 'vitest';

/**
 * Wait for async operations to complete
 */
export const waitFor = (ms: number = 0) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Flush all pending promises
 */
export const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

/**
 * Create a mock function that resolves after a delay
 */
export const createDelayedMock = <T>(value: T, delay: number = 100) => {
  return vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(value), delay)));
};

/**
 * Create a mock function that rejects after a delay
 */
export const createDelayedRejectMock = (error: Error, delay: number = 100) => {
  return vi.fn().mockImplementation(() => new Promise((_, reject) => setTimeout(() => reject(error), delay)));
};

/**
 * Generate a random UUID for testing
 */
export const generateTestId = () => `test-${Math.random().toString(36).substring(7)}`;

/**
 * Create mock file for upload testing
 */
export const createMockFile = (name: string, size: number, type: string): File => {
  const content = new Array(size).fill('a').join('');
  return new File([content], name, { type });
};

/**
 * Create mock event
 */
export const createMockEvent = (overrides: Partial<Event> = {}): Event => {
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...overrides,
  } as unknown as Event;
};

/**
 * Create mock change event for inputs
 */
export const createMockChangeEvent = (value: string) => ({
  target: { value },
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
});

/**
 * Assert that a function was called with matching object properties
 */
export const expectCalledWithMatch = (mockFn: ReturnType<typeof vi.fn>, expectedProps: Record<string, any>) => {
  expect(mockFn).toHaveBeenCalled();
  const calls = mockFn.mock.calls;
  const lastCall = calls[calls.length - 1];
  expect(lastCall[0]).toMatchObject(expectedProps);
};

/**
 * Mock console methods for cleaner test output
 */
export const mockConsole = () => {
  const originalConsole = { ...console };
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  return originalConsole;
};

/**
 * Create a date that is a specific number of days from now
 */
export const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Create a date that was a specific number of days ago
 */
export const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};
