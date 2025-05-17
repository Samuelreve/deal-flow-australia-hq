
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Deal } from "@/types/deal";

// Define interfaces for different timeline event types
export interface TimelineEvent {
  id: string;
  type: 'deal_created' | 'milestone_completed' | 'document_uploaded' | 'participant_added' | 'comment_added';
  timestamp: Date;
  title: string;
  description?: string;
  icon: React.ReactNode;
  user?: {
    id: string;
    name?: string;
    avatar?: string;
  };
}

export const useTimelineEvents = (deal: Deal) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimelineEvents = useCallback(async () => {
    if (!deal.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Start with deal creation event
      const baseEvents: TimelineEvent[] = [
        {
          id: `deal-created-${deal.id}`,
          type: 'deal_created',
          timestamp: deal.createdAt,
          title: 'Deal created',
          description: `Deal "${deal.title}" was created`,
          icon: null,
          user: deal.adminId ? { id: deal.adminId } : undefined
        }
      ];

      // Add milestone completion events
      const milestoneEvents: TimelineEvent[] = deal.milestones
        .filter(m => m.status === "completed" && m.completedAt)
        .map(milestone => ({
          id: `milestone-${milestone.id}`,
          type: 'milestone_completed',
          timestamp: milestone.completedAt!,
          title: `${milestone.title} completed`,
          icon: null,
          user: milestone.assignedTo?.length ? { id: milestone.assignedTo[0] } : undefined
        }));

      // Combine all events and sort by timestamp
      const combinedEvents = [...baseEvents, ...milestoneEvents];
      
      // If deal.id exists, fetch additional data from Supabase
      if (deal.id) {
        try {
          // Fetch document uploads
          const { data: documents, error: docError } = await supabase
            .from('documents')
            .select(`
              id,
              name,
              created_at,
              uploaded_by,
              profiles:uploaded_by (name, avatar_url)
            `)
            .eq('deal_id', deal.id);

          if (docError) throw docError;

          if (documents && documents.length > 0) {
            const documentEvents: TimelineEvent[] = documents.map(doc => ({
              id: `document-${doc.id}`,
              type: 'document_uploaded',
              timestamp: new Date(doc.created_at),
              title: 'Document uploaded',
              description: `Document "${doc.name}" was uploaded`,
              icon: null,
              user: doc.uploaded_by ? {
                id: doc.uploaded_by,
                name: doc.profiles?.name,
                avatar: doc.profiles?.avatar_url
              } : undefined
            }));
            
            combinedEvents.push(...documentEvents);
          }

          // Fetch participant additions
          const { data: participants, error: partError } = await supabase
            .from('deal_participants')
            .select(`
              id,
              user_id,
              role,
              joined_at,
              profiles:user_id (name, avatar_url)
            `)
            .eq('deal_id', deal.id);

          if (partError) throw partError;

          if (participants && participants.length > 0) {
            const participantEvents: TimelineEvent[] = participants.map(part => ({
              id: `participant-${part.id}`,
              type: 'participant_added',
              timestamp: new Date(part.joined_at),
              title: 'Participant added',
              description: `${part.profiles?.name || 'User'} joined as ${part.role}`,
              icon: null,
              user: part.user_id ? {
                id: part.user_id,
                name: part.profiles?.name,
                avatar: part.profiles?.avatar_url
              } : undefined
            }));
            
            combinedEvents.push(...participantEvents);
          }
          
          // Fetch comments
          const { data: comments, error: commentError } = await supabase
            .from('comments')
            .select(`
              id,
              content,
              created_at,
              user_id,
              profiles:user_id (name, avatar_url)
            `)
            .eq('deal_id', deal.id);
            
          if (commentError) throw commentError;
          
          if (comments && comments.length > 0) {
            const commentEvents: TimelineEvent[] = comments.map(comment => ({
              id: `comment-${comment.id}`,
              type: 'comment_added',
              timestamp: new Date(comment.created_at),
              title: 'Comment added',
              description: comment.content.length > 50 
                ? `${comment.content.substring(0, 50)}...` 
                : comment.content,
              icon: null,
              user: comment.user_id ? {
                id: comment.user_id,
                name: comment.profiles?.name,
                avatar: comment.profiles?.avatar_url
              } : undefined
            }));
            
            combinedEvents.push(...commentEvents);
          }
        } catch (err) {
          console.error("Error fetching additional timeline data:", err);
          // Continue with basic events if Supabase fetch fails
        }
      }

      // Sort all events chronologically 
      combinedEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setEvents(combinedEvents);
    } catch (err: any) {
      console.error("Error creating timeline:", err);
      setError("Failed to load timeline data");
    } finally {
      setLoading(false);
    }
  }, [deal]);

  useEffect(() => {
    fetchTimelineEvents();
  }, [fetchTimelineEvents]);

  return { events, loading, error };
};
