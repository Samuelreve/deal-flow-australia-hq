import { describe, it, expect, vi, beforeEach } from 'vitest';
import { commentMutationService } from '../commentMutationService';
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

describe('commentMutationService', () => {
  describe('createComment', () => {
    it('creates a new comment', async () => {
      const user = { id: 'user1' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });

      const dbComment = {
        id: 'c1',
        document_version_id: 'v1',
        user_id: 'user1',
        content: 'Hello',
        page_number: 1,
        location_data: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        resolved: false,
        parent_comment_id: null,
        user: { id: 'user1', name: 'Test User', avatar_url: 'avatar.png' }
      };

      const single = vi.fn().mockResolvedValue({ data: dbComment, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });

      mockSupabase.from.mockReturnValue({ insert });

      const result = await commentMutationService.createComment({ documentVersionId: 'v1', content: 'Hello', pageNumber: 1 });

      expect(insert).toHaveBeenCalledWith({
        document_version_id: 'v1',
        user_id: 'user1',
        content: 'Hello',
        page_number: 1,
        location_data: null,
        parent_comment_id: null
      });

      expect(result).toEqual({
        id: 'c1',
        documentVersionId: 'v1',
        userId: 'user1',
        content: 'Hello',
        pageNumber: 1,
        locationData: null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        resolved: false,
        parentCommentId: undefined,
        user: { id: 'user1', name: 'Test User', avatarUrl: 'avatar.png' },
        replies: []
      });
    });
  });

  describe('updateComment', () => {
    it('updates an existing comment', async () => {
      const eq = vi.fn().mockResolvedValue({ error: null });
      const update = vi.fn().mockReturnValue({ eq });

      mockSupabase.from.mockReturnValue({ update });

      await commentMutationService.updateComment('c1', 'Updated');

      expect(update).toHaveBeenCalledWith({ content: 'Updated' });
      expect(eq).toHaveBeenCalledWith('id', 'c1');
    });
  });

  describe('toggleResolved', () => {
    it('toggles resolved status', async () => {
      const selectEq = vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { resolved: false }, error: null }) });
      const select = vi.fn().mockReturnValue({ eq: selectEq });

      const updateEq = vi.fn().mockResolvedValue({ error: null });
      const update = vi.fn().mockReturnValue({ eq: updateEq });

      mockSupabase.from.mockReturnValue({ select, update });

      const result = await commentMutationService.toggleResolved('c1');

      expect(select).toHaveBeenCalledWith('resolved');
      expect(update).toHaveBeenCalledWith({ resolved: true });
      expect(updateEq).toHaveBeenCalledWith('id', 'c1');
      expect(result).toBe(true);
    });
  });
});

