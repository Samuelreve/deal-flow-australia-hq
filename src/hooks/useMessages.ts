
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

// Define message structure
interface MessageWithProfile {
  id: string;
  deal_id: string;
  sender_user_id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
}

export function useMessages(dealId: string) {
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  const fetchMessages = useCallback(async () => {
    if (!dealId) return;
    
    try {
      setLoading(true);
      
      // Use type assertion with unknown as intermediate step to avoid excessive type depth error
      const response = await supabase
        .from('messages')
        .select(`
          *,
          profiles (
            name,
            avatar_url
          )
        `)
        .eq('deal_id', dealId)
        .order('created_at', { ascending: true });
      
      const { data, error } = response as unknown as { 
        data: MessageWithProfile[] | null; 
        error: any 
      };
      
      if (error) throw error;
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  const sendMessage = async (content: string) => {
    if (!user || !dealId || !content.trim()) return;
    
    try {
      setSending(true);
      
      // Replace sender_user_id with user_id to match the expected schema
      const response = await supabase
        .from('messages')
        .insert({
          deal_id: dealId,
          user_id: user.id,
          content: content.trim()
        });
      
      const { error } = response as unknown as { error: any };
      
      if (error) throw error;
      
      // We don't need to update the messages array manually
      // since the realtime subscription will handle that
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
    if (!dealId) return;
    
    const channel = supabase
      .channel(`deal-messages-${dealId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `deal_id=eq.${dealId}`
        },
        async (payload) => {
          // When a new message is inserted, we need to fetch the sender's profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', payload.new.sender_user_id)
            .single();
          
          const newMessage = {
            ...payload.new,
            profiles: profileData
          } as MessageWithProfile;
          
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      )
      .subscribe();
    
    // Fetch initial messages
    fetchMessages();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId, fetchMessages]);

  return {
    messages,
    loading,
    sending,
    sendMessage
  };
}

export default useMessages;
