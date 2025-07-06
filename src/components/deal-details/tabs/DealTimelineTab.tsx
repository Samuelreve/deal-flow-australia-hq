import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  FileText, 
  UserPlus, 
  MessageSquare, 
  CheckCircle,
  Plus,
  Share,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimelineEvent {
  id: string;
  type: 'deal_created' | 'milestone_completed' | 'document_uploaded' | 'participant_added' | 'message_sent' | 'status_changed';
  title: string;
  description?: string;
  created_at: string;
  user_name?: string;
  metadata?: any;
}

interface DealTimelineTabProps {
  dealId: string;
}

const DealTimelineTab: React.FC<DealTimelineTabProps> = ({ dealId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTimelineEvents();
  }, [dealId]);

  const fetchTimelineEvents = async () => {
    try {
      // Fetch various events and combine them into a timeline
      const [
        { data: milestones },
        { data: documents },
        { data: participants },
        { data: messages },
        { data: deal }
      ] = await Promise.all([
        supabase
          .from('milestones')
          .select('*')
          .eq('deal_id', dealId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('documents')
          .select('*')
          .eq('deal_id', dealId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('deal_participants')
          .select(`
            *,
            profiles!deal_participants_user_id_fkey (
              name
            )
          `)
          .eq('deal_id', dealId)
          .order('joined_at', { ascending: false }),
        
        supabase
          .from('messages')
          .select('*')
          .eq('deal_id', dealId)
          .order('created_at', { ascending: false })
          .limit(10), // Limit messages to avoid too many timeline entries
        
        supabase
          .from('deals')
          .select('*')
          .eq('id', dealId)
          .single()
      ]);

      const timelineEvents: TimelineEvent[] = [];

      // Add deal creation event
      if (deal) {
        timelineEvents.push({
          id: `deal-created-${deal.id}`,
          type: 'deal_created',
          title: 'Deal Created',
          description: `Deal "${deal.title}" was created`,
          created_at: deal.created_at,
          user_name: 'System'
        });
      }

      // Add milestone events
      milestones?.forEach(milestone => {
        if (milestone.status === 'completed') {
          timelineEvents.push({
            id: `milestone-${milestone.id}`,
            type: 'milestone_completed',
            title: 'Milestone Completed',
            description: `"${milestone.title}" was completed`,
            created_at: milestone.completed_at || milestone.updated_at,
            user_name: 'System'
          });
        }
      });

      // Add document upload events
      documents?.forEach(doc => {
        timelineEvents.push({
          id: `document-${doc.id}`,
          type: 'document_uploaded',
          title: 'Document Uploaded',
          description: `"${doc.name}" was uploaded`,
          created_at: doc.created_at,
          user_name: 'System'
        });
      });

      // Add participant events
      participants?.forEach(participant => {
        timelineEvents.push({
          id: `participant-${participant.id}`,
          type: 'participant_added',
          title: 'Participant Added',
          description: `${participant.profiles?.name || 'Unknown User'} joined as ${participant.role}`,
          created_at: participant.joined_at,
          user_name: 'System'
        });
      });

      // Add message events (limited)
      messages?.forEach(message => {
        timelineEvents.push({
          id: `message-${message.id}`,
          type: 'message_sent',
          title: 'Message Sent',
          description: message.content.length > 50 
            ? message.content.substring(0, 50) + '...' 
            : message.content,
          created_at: message.created_at,
          user_name: 'User'
        });
      });

      // Sort by date (most recent first)
      timelineEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setEvents(timelineEvents);
    } catch (error) {
      console.error('Error fetching timeline events:', error);
      toast({
        title: "Error",
        description: "Failed to load timeline events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'deal_created':
        return <Plus className="h-4 w-4" />;
      case 'milestone_completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'document_uploaded':
        return <FileText className="h-4 w-4" />;
      case 'participant_added':
        return <UserPlus className="h-4 w-4" />;
      case 'message_sent':
        return <MessageSquare className="h-4 w-4" />;
      case 'status_changed':
        return <Edit className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'deal_created':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'milestone_completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'document_uploaded':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'participant_added':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'message_sent':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'status_changed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 168) { // Less than a week
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-AU', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Deal Timeline</h3>
        <p className="text-sm text-muted-foreground">
          Complete history of all deal activities and events
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No timeline events found</p>
              <p className="text-sm text-muted-foreground">Activity will appear here as the deal progresses</p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
            
            {events.map((event, index) => (
              <div key={event.id} className="relative flex items-start gap-4 pb-6">
                {/* Timeline dot */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 bg-background flex items-center justify-center z-10 ${
                  getEventColor(event.type).includes('blue') ? 'border-blue-200' :
                  getEventColor(event.type).includes('green') ? 'border-green-200' :
                  getEventColor(event.type).includes('purple') ? 'border-purple-200' :
                  getEventColor(event.type).includes('orange') ? 'border-orange-200' :
                  getEventColor(event.type).includes('indigo') ? 'border-indigo-200' :
                  'border-gray-200'
                }`}>
                  {getEventIcon(event.type)}
                </div>
                
                {/* Event content */}
                <div className="flex-1 min-w-0">
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge className={getEventColor(event.type)}>
                            {event.type.replace('_', ' ').toLowerCase()}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(event.created_at)}
                        </span>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                      )}
                      
                      {event.user_name && (
                        <p className="text-xs text-muted-foreground">
                          by {event.user_name}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealTimelineTab;