import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UnreadCounts {
  dealChat: number;
  privateMessages: { [userId: string]: number };
  total: number;
}

export function useUnreadMessageCounts(dealId: string) {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    dealChat: 0,
    privateMessages: {},
    total: 0
  });
  const { user } = useAuth();

  const fetchUnreadCounts = useCallback(async () => {
    if (!dealId || !user?.id) return;

    try {
      // Get unread deal chat messages (no recipient)
      const { data: dealChatUnread } = await supabase
        .from('messages')
        .select('id')
        .eq('deal_id', dealId)
        .is('recipient_user_id', null)
        .is('read_at', null)
        .neq('sender_user_id', user.id);

      // Get unread private messages grouped by sender
      const { data: privateUnread } = await supabase
        .from('messages')
        .select('sender_user_id')
        .eq('deal_id', dealId)
        .eq('recipient_user_id', user.id)
        .is('read_at', null)
        .neq('sender_user_id', user.id);

      // Count private messages by sender
      const privateMessageCounts: { [userId: string]: number } = {};
      privateUnread?.forEach(msg => {
        privateMessageCounts[msg.sender_user_id] = 
          (privateMessageCounts[msg.sender_user_id] || 0) + 1;
      });

      const dealChatCount = dealChatUnread?.length || 0;
      const totalPrivateCount = Object.values(privateMessageCounts).reduce((sum, count) => sum + count, 0);

      setUnreadCounts({
        dealChat: dealChatCount,
        privateMessages: privateMessageCounts,
        total: dealChatCount + totalPrivateCount
      });
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  }, [dealId, user?.id]);

  const markAsRead = useCallback(async (recipientUserId?: string) => {
    if (!dealId || !user?.id) return;

    try {
      await supabase.rpc('mark_messages_as_read', {
        p_deal_id: dealId,
        p_recipient_user_id: recipientUserId
      });
      
      // Refresh counts after marking as read
      fetchUnreadCounts();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [dealId, user?.id, fetchUnreadCounts]);

  // Set up realtime subscription for new messages
  useEffect(() => {
    if (!dealId || !user?.id) return;

    console.log('🔔 Setting up realtime subscription for dealId:', dealId);

    const channel = supabase
      .channel(`unread-messages-${dealId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `deal_id=eq.${dealId}`
        },
        (payload) => {
          console.log('🔔 Realtime message received:', payload);
          const newMessage = payload.new as any;
          
          // Only count messages not sent by current user
          if (newMessage.sender_user_id !== user.id) {
            console.log('🔔 Updating unread counts for message from:', newMessage.sender_user_id);
            
            // Use functional state update to ensure we have the latest state
            setUnreadCounts(prevCounts => {
              console.log('🔔 Previous counts:', prevCounts);
              
              if (newMessage.recipient_user_id === null) {
                // Deal chat message
                const newCounts = {
                  ...prevCounts,
                  dealChat: prevCounts.dealChat + 1,
                  total: prevCounts.total + 1
                };
                console.log('🔔 New deal chat counts:', newCounts);
                return newCounts;
              } else if (newMessage.recipient_user_id === user.id) {
                // Private message to current user
                const senderId = newMessage.sender_user_id;
                const currentPrivateCount = prevCounts.privateMessages[senderId] || 0;
                const newCounts = {
                  ...prevCounts,
                  privateMessages: {
                    ...prevCounts.privateMessages,
                    [senderId]: currentPrivateCount + 1
                  },
                  total: prevCounts.total + 1
                };
                console.log('🔔 New private message counts:', newCounts);
                return newCounts;
              }
              
              return prevCounts;
            });
          } else {
            console.log('🔔 Ignoring message from current user');
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `deal_id=eq.${dealId}`
        },
        () => {
          // Refresh counts when messages are marked as read
          fetchUnreadCounts();
        }
      )
      .subscribe();

    // Initial fetch
    fetchUnreadCounts();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId, user?.id, fetchUnreadCounts]);

  return {
    unreadCounts,
    markAsRead,
    refreshCounts: fetchUnreadCounts
  };
}