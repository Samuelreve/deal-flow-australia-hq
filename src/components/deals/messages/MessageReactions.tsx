import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

interface MessageReactionsProps {
  messageId: string;
  showAddButton?: boolean;
}

const COMMON_REACTIONS = ['👍', '❤️', '😂', '🎉', '👀', '🔥', '✅', '💯'];

export function MessageReactions({ messageId, showAddButton = false }: MessageReactionsProps) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reactions
  useEffect(() => {
    fetchReactions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`reactions-${messageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId]);

  const fetchReactions = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setReactions(data || []);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addReaction = async (emoji: string) => {
    if (!user) return;

    try {
      // Check if user already reacted with this emoji
      const existing = reactions.find(
        r => r.user_id === user.id && r.reaction === emoji
      );

      if (existing) {
        // Remove reaction
        const { error } = await (supabase as any)
          .from('message_reactions')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await (supabase as any)
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            reaction: emoji
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.reaction]) {
      acc[reaction.reaction] = {
        count: 0,
        users: [],
        hasCurrentUser: false
      };
    }
    acc[reaction.reaction].count++;
    acc[reaction.reaction].users.push(reaction.user_id);
    if (reaction.user_id === user?.id) {
      acc[reaction.reaction].hasCurrentUser = true;
    }
    return acc;
  }, {} as Record<string, { count: number; users: string[]; hasCurrentUser: boolean }>);

  const hasReactions = Object.keys(groupedReactions).length > 0;

  return (
    <div className="flex items-center gap-1 mt-1 flex-wrap min-h-[28px]">
      {/* Existing reactions */}
      {Object.entries(groupedReactions).map(([emoji, data]) => (
        <button
          key={emoji}
          onClick={() => addReaction(emoji)}
          className={`
            px-2 py-0.5 rounded-full text-xs font-medium
            transition-all hover:scale-110
            ${data.hasCurrentUser 
              ? 'bg-primary/20 border border-primary/30' 
              : 'bg-muted hover:bg-muted/80'
            }
          `}
          title={`${data.count} reaction${data.count > 1 ? 's' : ''}`}
        >
          <span className="mr-1">{emoji}</span>
          {data.count > 1 && <span>{data.count}</span>}
        </button>
      ))}

      {/* Add reaction button - always rendered with opacity control */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 rounded-full hover:bg-muted transition-opacity ${
              showAddButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 bg-popover" align="start">
          <div className="grid grid-cols-4 gap-1">
            {COMMON_REACTIONS.map(emoji => {
              const hasReacted = reactions.some(
                r => r.reaction === emoji && r.user_id === user?.id
              );
              return (
                <button
                  key={emoji}
                  onClick={() => addReaction(emoji)}
                  className={`
                    p-2 text-2xl rounded hover:bg-muted
                    transition-all hover:scale-125
                    ${hasReacted ? 'bg-primary/20' : ''}
                  `}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
