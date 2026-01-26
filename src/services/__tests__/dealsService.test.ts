/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock query builder helper
const createMockQueryBuilder = (resolvedData: any = null, error: any = null) => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: resolvedData, error }),
  then: (resolve: any) => resolve({ data: resolvedData, error, count: Array.isArray(resolvedData) ? resolvedData.length : 0 }),
});

// Mock Supabase client - define mock BEFORE vi.mock
vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    },
  };
});

// Import after mock
import { dealsService, Deal } from '../dealsService';
import { supabase } from '@/integrations/supabase/client';

// Get the mocked supabase for assertions
const mockSupabase = vi.mocked(supabase);

describe('dealsService', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockDeal: Deal = {
    id: 'deal-123',
    title: 'Test Deal',
    description: 'Test description',
    status: 'active',
    health_score: 75,
    seller_id: 'user-123',
    buyer_id: 'buyer-456',
    asking_price: 100000,
    business_name: 'Test Business',
    business_industry: 'Technology',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-06-15T15:30:00Z',
    seller: { name: 'Seller Name' },
    buyer: { name: 'Buyer Name' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDeals', () => {
    it('should return empty array when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await dealsService.getDeals();

      expect(result).toEqual({ deals: [], totalCount: 0 });
    });

    it('should fetch deals for authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      // Mock for deal_participants query
      const participantsBuilder = createMockQueryBuilder([{ deal_id: 'deal-123' }]);
      // Mock for deals query
      const dealsBuilder = createMockQueryBuilder([mockDeal]);

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'deal_participants') return participantsBuilder;
        if (table === 'deals') return dealsBuilder;
        return createMockQueryBuilder([]);
      });

      const result = await dealsService.getDeals();

      expect(mockSupabase.from).toHaveBeenCalledWith('deal_participants');
      expect(mockSupabase.from).toHaveBeenCalledWith('deals');
      expect(result.deals).toEqual([mockDeal]);
    });

    it('should apply pagination when provided', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const participantsBuilder = createMockQueryBuilder([]);
      const dealsBuilder = createMockQueryBuilder([mockDeal]);

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'deal_participants') return participantsBuilder;
        if (table === 'deals') return dealsBuilder;
        return createMockQueryBuilder([]);
      });

      await dealsService.getDeals({ page: 2, limit: 10 });

      expect(dealsBuilder.range).toHaveBeenCalledWith(10, 19);
    });

    it('should throw error when query fails', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const participantsBuilder = createMockQueryBuilder([]);
      const dealsBuilder = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: null, error: new Error('Query failed'), count: 0 }),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'deal_participants') return participantsBuilder;
        if (table === 'deals') return dealsBuilder;
        return createMockQueryBuilder([]);
      });

      await expect(dealsService.getDeals()).rejects.toThrow('Query failed');
    });
  });

  describe('createDeal', () => {
    it('should throw error when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      await expect(dealsService.createDeal({ title: 'New Deal' })).rejects.toThrow(
        'User not authenticated'
      );
    });

    it('should create deal with correct data', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const createdDeal = { ...mockDeal, id: 'new-deal-123' };
      const queryBuilder = createMockQueryBuilder(createdDeal);
      mockSupabase.from.mockReturnValue(queryBuilder);

      const newDealData = {
        title: 'New Deal',
        description: 'New deal description',
        asking_price: 50000,
        business_industry: 'Healthcare',
      };

      const result = await dealsService.createDeal(newDealData);

      expect(mockSupabase.from).toHaveBeenCalledWith('deals');
      expect(queryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Deal',
          description: 'New deal description',
          seller_id: 'user-123',
          status: 'draft',
          health_score: 0,
          asking_price: 50000,
          business_industry: 'Healthcare',
        })
      );
      expect(result).toEqual(createdDeal);
    });

    it('should use provided status when specified', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const queryBuilder = createMockQueryBuilder(mockDeal);
      mockSupabase.from.mockReturnValue(queryBuilder);

      await dealsService.createDeal({ title: 'New Deal', status: 'active' });

      expect(queryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active',
        })
      );
    });

    it('should throw error when creation fails', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const queryBuilder = createMockQueryBuilder(null, new Error('Insert failed'));
      mockSupabase.from.mockReturnValue(queryBuilder);

      await expect(dealsService.createDeal({ title: 'New Deal' })).rejects.toThrow('Insert failed');
    });
  });

  describe('updateDeal', () => {
    it('should update deal with correct data', async () => {
      const updatedDeal = { ...mockDeal, title: 'Updated Title' };
      const queryBuilder = createMockQueryBuilder(updatedDeal);
      mockSupabase.from.mockReturnValue(queryBuilder);

      const result = await dealsService.updateDeal('deal-123', { title: 'Updated Title' });

      expect(mockSupabase.from).toHaveBeenCalledWith('deals');
      expect(queryBuilder.update).toHaveBeenCalledWith({ title: 'Updated Title' });
      expect(queryBuilder.eq).toHaveBeenCalledWith('id', 'deal-123');
      expect(result).toEqual(updatedDeal);
    });

    it('should only include defined fields in update', async () => {
      const queryBuilder = createMockQueryBuilder(mockDeal);
      mockSupabase.from.mockReturnValue(queryBuilder);

      await dealsService.updateDeal('deal-123', {
        title: 'New Title',
        description: undefined,
        status: 'completed',
      });

      expect(queryBuilder.update).toHaveBeenCalledWith({
        title: 'New Title',
        status: 'completed',
      });
    });

    it('should throw error when update fails', async () => {
      const queryBuilder = createMockQueryBuilder(null, new Error('Update failed'));
      mockSupabase.from.mockReturnValue(queryBuilder);

      await expect(dealsService.updateDeal('deal-123', { title: 'New' })).rejects.toThrow(
        'Update failed'
      );
    });
  });

  describe('deleteDeal', () => {
    it('should throw error when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      await expect(dealsService.deleteDeal('deal-123')).rejects.toThrow('User not authenticated');
    });

    it('should throw error when deal is not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const queryBuilder = createMockQueryBuilder(null, new Error('Not found'));
      mockSupabase.from.mockReturnValue(queryBuilder);

      await expect(dealsService.deleteDeal('deal-123')).rejects.toThrow('Deal not found');
    });

    it('should throw error when user is not authorized', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      // Deal with different seller
      const dealQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { seller_id: 'other-user' }, error: null }),
      };

      // Profile without admin role
      const profileQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { role: 'seller' }, error: null }),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'deals') return dealQueryBuilder;
        if (table === 'profiles') return profileQueryBuilder;
        return createMockQueryBuilder(null);
      });

      await expect(dealsService.deleteDeal('deal-123')).rejects.toThrow('Permission denied');
    });

    it('should allow seller to delete their own deal', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      // Deal with same seller
      const dealQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { seller_id: 'user-123' }, error: null }),
        delete: vi.fn().mockReturnThis(),
      };

      // Add delete capabilities
      const deleteBuilder = {
        eq: vi.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ error: null }),
      };

      let callCount = 0;
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'deals') {
          callCount++;
          if (callCount === 1) return dealQueryBuilder;
          return {
            delete: vi.fn().mockReturnValue(deleteBuilder),
          };
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { role: 'seller' }, error: null }),
          };
        }
        return createMockQueryBuilder(null);
      });

      await expect(dealsService.deleteDeal('deal-123')).resolves.not.toThrow();
    });

    it('should allow admin to delete any deal', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      // Deal with different seller
      const dealQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { seller_id: 'other-user' }, error: null }),
      };

      // Profile with admin role
      const profileQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
      };

      const deleteBuilder = {
        eq: vi.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ error: null }),
      };

      let callCount = 0;
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'deals') {
          callCount++;
          if (callCount === 1) return dealQueryBuilder;
          return {
            delete: vi.fn().mockReturnValue(deleteBuilder),
          };
        }
        if (table === 'profiles') return profileQueryBuilder;
        return createMockQueryBuilder(null);
      });

      await expect(dealsService.deleteDeal('deal-123')).resolves.not.toThrow();
    });
  });
});
