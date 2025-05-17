
import { TimelineEvent as TimelineEventType } from "@/hooks/useTimelineEvents";
import { FileText, Users, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TimelineEventProps {
  event: TimelineEventType;
}

const TimelineEvent = ({ event }: TimelineEventProps) => {
  // Helper function to get event icon based on type
  const getEventIcon = (type: TimelineEventType["type"]) => {
    switch (type) {
      case "milestone_completed":
        return <FileText className="h-5 w-5" />;
      case "document_uploaded":
        return <FileText className="h-5 w-5" />;
      case "participant_added":
        return <Users className="h-5 w-5" />;
      case "comment_added":
        return <MessageSquare className="h-5 w-5" />;
      case "deal_created":
      default:
        return <Users className="h-5 w-5" />;
    }
  };
  
  // Format date for display
  const formatDate = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric"
    }).format(timestamp);
  };
  
  return (
    <div key={event.id} className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        {event.icon || getEventIcon(event.type)}
      </div>
      <div>
        <p className="font-medium">{event.title}</p>
        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}
        <p className="text-sm text-muted-foreground">
          {formatDate(event.timestamp)}
          
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
  );
};

export default TimelineEvent;
