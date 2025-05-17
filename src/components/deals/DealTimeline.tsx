
import { useState, useEffect, useCallback } from "react";
import { FileText, Users } from "lucide-react";
import { Deal, Milestone } from "@/types/deal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DealTimelineProps {
  deal: Deal;
}

// Define interfaces for different timeline event types
interface TimelineEvent {
  id: string;
  type: 'deal_created' | 'milestone_completed' | 'document_uploaded' | 'participant_added';
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

const DealTimeline = ({ deal }: DealTimelineProps) => {
  const { user, isAuthenticated } = useAuth();
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
          icon: <Users className="h-5 w-5" />,
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
          icon: <FileText className="h-5 w-5" />,
          user: milestone.assignedTo?.length ? { id: milestone.assignedTo[0] } : undefined
        }));

      // Combine all events and sort by timestamp
      const combinedEvents = [...baseEvents, ...milestoneEvents];
      
      // If authenticated, try to fetch additional data from Supabase
      if (isAuthenticated && deal.id) {
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
              icon: <FileText className="h-5 w-5" />,
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
              icon: <Users className="h-5 w-5" />,
              user: part.user_id ? {
                id: part.user_id,
                name: part.profiles?.name,
                avatar: part.profiles?.avatar_url
              } : undefined
            }));
            
            combinedEvents.push(...participantEvents);
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
  }, [deal, isAuthenticated]);

  useEffect(() => {
    fetchTimelineEvents();
  }, [fetchTimelineEvents]);

  if (loading) {
    return <div className="text-center text-muted-foreground text-sm py-4">Loading timeline...</div>;
  }

  if (error) {
    return <div className="text-center text-destructive text-sm py-4">{error}</div>;
  }

  if (events.length === 0) {
    return <div className="text-center text-muted-foreground text-sm py-4">No timeline events available</div>;
  }

  return (
    <div className="space-y-4">
      {events.map(event => (
        <div key={event.id} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {event.icon}
          </div>
          <div>
            <p className="font-medium">{event.title}</p>
            {event.description && (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {new Intl.DateTimeFormat("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "numeric"
              }).format(event.timestamp)}
              
              {event.user?.name && (
                <span className="ml-2 flex items-center gap-1 mt-1">
                  <span>by</span>
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarImage 
                      src={event.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.user.name)}&background=0D8ABC&color=fff`} 
                      alt={event.user.name} 
                    />
                    <AvatarFallback>{event.user.name[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <span>{event.user.name}</span>
                </span>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DealTimeline;
