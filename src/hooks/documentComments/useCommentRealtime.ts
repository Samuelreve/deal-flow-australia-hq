
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentComment } from '@/types/documentComment';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Custom hook for setting up and managing real-time updates for document comments
 */
export function useCommentRealtime(
  documentVersionId: string | undefined,
  onInsert?: (newComment: DocumentComment) => void,
  onUpdate?: (updatedComment: DocumentComment) => void,
  onDelete?: (deletedComment: DocumentComment) => void
) {
  const [commentsChannel, setCommentsChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!documentVersionId) {
      console.log('No document version ID provided for real-time subscription');
      return;
    }

    console.log('Setting up real-time subscription for document version:', documentVersionId);

    // Setup realtime subscription with a unique channel name
    const channelName = `document_comments_${documentVersionId}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'document_comments', 
          filter: `document_version_id=eq.${documentVersionId}` 
        },
        async (payload) => {
          console.log('Realtime comment INSERT received:', payload);
          const newComment = payload.new as DocumentComment;
          
          // Fetch the user profile data for the new comment
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', newComment.user_id)
            .single();
          
          // Transform the comment to match our interface
          const commentWithProfile = {
            ...newComment,
            user: profileData ? {
              id: newComment.user_id,
              name: profileData.name,
              avatar_url: profileData.avatar_url
            } : undefined
          } as DocumentComment;
          
          console.log('Processed new comment with profile:', commentWithProfile);
          if (onInsert) onInsert(commentWithProfile);
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'document_comments', 
          filter: `document_version_id=eq.${documentVersionId}` 
        },
        async (payload) => {
          console.log('Realtime comment UPDATE received:', payload);
          const updatedComment = payload.new as DocumentComment;
          
          // Fetch the user profile data for the updated comment
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', updatedComment.user_id)
            .single();
          
          // Transform the comment to match our interface
          const commentWithProfile = {
            ...updatedComment,
            user: profileData ? {
              id: updatedComment.user_id,
              name: profileData.name,
              avatar_url: profileData.avatar_url
            } : undefined
          } as DocumentComment;
          
          console.log('Processed updated comment with profile:', commentWithProfile);
          if (onUpdate) onUpdate(commentWithProfile);
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'document_comments', 
          filter: `document_version_id=eq.${documentVersionId}` 
        },
        (payload) => {
          console.log('Realtime comment DELETE received:', payload);
          const deletedComment = payload.old as DocumentComment;
          if (onDelete) onDelete(deletedComment);
        }
      )
      .subscribe((status) => {
        console.log('Document comments subscription status:', status);
      });
    
    setCommentsChannel(channel);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up document comments subscription for:', documentVersionId);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [documentVersionId, onInsert, onUpdate, onDelete]);

  return { commentsChannel };
}
