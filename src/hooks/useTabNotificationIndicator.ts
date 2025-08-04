import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useTabNotificationIndicator(dealId: string) {
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const { user } = useAuth();

  const checkForUnreadMessages = useCallback(async () => {
    if (!dealId || !user?.id) return;

    try {
      // Check if there are any unread messages for this user in this deal
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('deal_id', dealId)
        .is('read_at', null)
        .neq('sender_user_id', user.id)
        .limit(1);

      setHasUnreadMessages((unreadMessages?.length || 0) > 0);
    } catch (error) {
      console.error('Error checking for unread messages:', error);
    }
  }, [dealId, user?.id]);

  const markTabAsViewed = useCallback(() => {
    // When user visits the Messages tab, we consider the tab notification as "seen"
    setHasUnreadMessages(false);
  }, []);

  // Set up realtime subscription for new messages only
  useEffect(() => {
    if (!dealId || !user?.id) return;

    console.log('🔔 Setting up tab notification subscription for dealId:', dealId);

    const channel = supabase
      .channel(`tab-notification-${dealId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `deal_id=eq.${dealId}`
        },
        (payload) => {
          console.log('🔔 Tab notification: New message received:', payload);
          const newMessage = payload.new as any;
          
          // Only show indicator for messages not sent by current user
          if (newMessage.sender_user_id !== user.id) {
            console.log('🔔 Tab notification: Showing indicator for new message');
            setHasUnreadMessages(true);
          }
        }
      )
      .subscribe();

    // Initial check
    checkForUnreadMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId, user?.id, checkForUnreadMessages]);

  return {
    hasUnreadMessages,
    markTabAsViewed
  };
}