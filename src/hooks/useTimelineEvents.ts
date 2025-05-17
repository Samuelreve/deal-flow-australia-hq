
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Deal } from "@/types/deal";
import { FileText, Users, MessageSquare, PackageCheck } from "lucide-react";
import React from 'react';

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
      // Call the Supabase RPC function to get timeline events
      const { data, error } = await supabase.rpc(
        'get_deal_timeline', 
        { deal_uuid: deal.id }
      );

      if (error) throw error;

      // Transform the data into our TimelineEvent format
      if (data) {
        const transformedEvents: TimelineEvent[] = data.map((event: any) => {
          // Get the appropriate icon for this event type
          let eventIcon;
          switch (event.type) {
            case 'milestone_completed':
              eventIcon = <PackageCheck className="h-5 w-5" />;
              break;
            case 'document_uploaded':
              eventIcon = <FileText className="h-5 w-5" />;
              break;
            case 'participant_added':
              eventIcon = <Users className="h-5 w-5" />;
              break;
            case 'comment_added':
              eventIcon = <MessageSquare className="h-5 w-5" />;
              break;
            case 'deal_created':
            default:
              eventIcon = <Users className="h-5 w-5" />;
          }

          return {
            id: event.id,
            type: event.type,
            timestamp: new Date(event.timestamp),
            title: event.title,
            description: event.description,
            icon: eventIcon,
            user: event.user_id ? {
              id: event.user_id,
              name: event.user_name,
              avatar: event.user_avatar
            } : undefined
          };
        });

        setEvents(transformedEvents);
      }
    } catch (err: any) {
      console.error("Error fetching timeline data:", err);
      setError("Failed to load timeline data");
    } finally {
      setLoading(false);
    }
  }, [deal.id]);

  useEffect(() => {
    fetchTimelineEvents();
  }, [fetchTimelineEvents]);

  return { events, loading, error };
};
