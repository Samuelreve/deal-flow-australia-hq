import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

// Define message structure for private messages
interface PrivateMessageWithProfile {
  id: string;
  deal_id: string;
  sender_user_id: string;
  recipient_user_id: string | null;
  content: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
}

export function usePrivateMessages(dealId: string, recipientUserId?: string) {
  const [messages, setMessages] = useState<PrivateMessageWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  const fetchMessages = useCallback(async () => {
    if (!dealId) return;
    
    try {
      setLoading(true);
      
      let query = (supabase as any)
        .from('messages')
        .select(`
          *,
          profiles!sender_user_id (
            name,
            avatar_url
          )
        `)
        .eq('deal_id', dealId)
        .order('created_at', { ascending: true });

      if (recipientUserId) {
        // Fetch private messages between current user and specific recipient only
        query = query.and(
          `or(and(sender_user_id.eq.${user?.id},recipient_user_id.eq.${recipientUserId}),and(sender_user_id.eq.${recipientUserId},recipient_user_id.eq.${user?.id}))`
        );
      } else {
        // Fetch deal-wide messages (no recipient)
        query = query.is('recipient_user_id', null);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [dealId, recipientUserId, user?.id]);

  const sendMessage = async (content: string) => {
    if (!user || !dealId || !content.trim()) return;
    
    try {
      setSending(true);
      
      const messageData: any = {
        deal_id: dealId,
        sender_user_id: user.id,
        content: content.trim()
      };

      // Add recipient if this is a private message
      if (recipientUserId) {
        messageData.recipient_user_id = recipientUserId;
      }
      
      console.log('Sending message:', {
        messageData,
        currentRecipient: recipientUserId,
        isDealChat: !recipientUserId
      });
      
      const { error } = await (supabase as any)
        .from('messages')
        .insert(messageData);
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Please try again later",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSending(false);
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!dealId || !user?.id) return;
    
    const channel = supabase
      .channel(`private-messages-${dealId}-${recipientUserId || 'deal'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `deal_id=eq.${dealId}`
        },
        async (payload) => {
          // Only process messages that match our filter criteria
          const newMsg = payload.new as any;
          
          console.log('Realtime message received:', {
            sender_user_id: newMsg.sender_user_id,
            recipient_user_id: newMsg.recipient_user_id,
            content: newMsg.content,
            currentUserId: user.id,
            selectedRecipient: recipientUserId
          });
          
          if (recipientUserId) {
            // For private messages, only show messages between current user and recipient
            const isRelevantPrivateMessage = 
              (newMsg.sender_user_id === user.id && newMsg.recipient_user_id === recipientUserId) ||
              (newMsg.sender_user_id === recipientUserId && newMsg.recipient_user_id === user.id);
            
            console.log('Private message filter result:', isRelevantPrivateMessage);
            if (!isRelevantPrivateMessage) return;
          } else {
            // For deal-wide messages, only show messages with no recipient
            console.log('Deal chat filter - has recipient?', newMsg.recipient_user_id !== null);
            if (newMsg.recipient_user_id !== null) return;
          }

          // Fetch sender's profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', newMsg.sender_user_id)
            .single();
          
          const newMessage = {
            ...newMsg,
            profiles: profileData
          } as PrivateMessageWithProfile;
          
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      )
      .subscribe();
    
    // Fetch initial messages
    fetchMessages();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId, recipientUserId, user?.id, fetchMessages]);

  return {
    messages,
    loading,
    sending,
    sendMessage
  };
}