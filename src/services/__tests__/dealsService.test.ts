import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dealsService } from '../dealsService';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn()
  }
}));

const mockSupabase = supabase as unknown as {
  auth: { getUser: any };
  from: any;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('dealsService', () => {
  describe('getDeals', () => {
    it('returns user deals and count', async () => {
      const user = { id: 'user1' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });

      const participantSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [{ deal_id: 'deal1' }], error: null })
      });

      const dealsData = [{
        id: 'deal1',
        title: 'Test Deal',
        status: 'open',
        health_score: 0,
        seller_id: 'user1',
        created_at: '',
        updated_at: ''
      }];

      const dealsQuery = {
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: dealsData, error: null, count: 1 })
      };

      const dealsSelect = vi.fn().mockReturnValue(dealsQuery);

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'deal_participants') {
          return { select: participantSelect };
        }
        if (table === 'deals') {
          return { select: dealsSelect };
        }
      });

      const result = await dealsService.getDeals();

      expect(result).toEqual({ deals: dealsData, totalCount: 1 });
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('deal_participants');
      expect(mockSupabase.from).toHaveBeenCalledWith('deals');
    });
  });

  describe('createDeal', () => {
    it('inserts a new deal', async () => {
      const user = { id: 'user1' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });

      const insertedDeal = {
        id: 'd1',
        title: 'New Deal',
        status: 'draft',
        health_score: 0,
        seller_id: 'user1',
        created_at: '',
        updated_at: ''
      };

      const single = vi.fn().mockResolvedValue({ data: insertedDeal, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });

      mockSupabase.from.mockReturnValue({ insert });

      const result = await dealsService.createDeal({ title: 'New Deal' });

      expect(insert).toHaveBeenCalledWith({
        title: 'New Deal',
        description: undefined,
        seller_id: 'user1',
        status: 'draft',
        health_score: 0,
        asking_price: undefined,
        business_industry: undefined,
        target_completion_date: undefined
      });
      expect(result).toEqual(insertedDeal);
    });
  });

  describe('updateDeal', () => {
    it('updates an existing deal', async () => {
      const updatedDeal = {
        id: 'd1',
        title: 'Updated',
        status: 'draft',
        health_score: 0,
        seller_id: 'seller',
        created_at: '',
        updated_at: ''
      };

      const single = vi.fn().mockResolvedValue({ data: updatedDeal, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });

      mockSupabase.from.mockReturnValue({ update });

      const result = await dealsService.updateDeal('d1', { title: 'Updated' });

      expect(update).toHaveBeenCalledWith({ title: 'Updated' });
      expect(eq).toHaveBeenCalledWith('id', 'd1');
      expect(result).toEqual(updatedDeal);
    });
  });
});

