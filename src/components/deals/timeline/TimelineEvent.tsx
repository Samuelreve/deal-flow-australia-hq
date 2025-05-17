
import { TimelineEvent as TimelineEventType } from "@/hooks/useTimelineEvents";
import { getEventIcon } from "./utils/timelineIcons";
import { formatTimestamp } from "./utils/dateFormatter";
import TimelineEventUser from "./TimelineEventUser";

interface TimelineEventProps {
  event: TimelineEventType;
}

const TimelineEvent = ({ event }: TimelineEventProps) => {
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
          {formatTimestamp(event.timestamp)}
          
          {event.user?.name && <TimelineEventUser user={event.user} />}
        </p>
      </div>
    </div>
  );
};

export default TimelineEvent;
