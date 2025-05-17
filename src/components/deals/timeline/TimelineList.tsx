
import TimelineEvent from "./TimelineEvent";
import { TimelineEvent as TimelineEventType } from "@/hooks/useTimelineEvents";

interface TimelineListProps {
  events: TimelineEventType[];
  loading: boolean;
  error: string | null;
}

const TimelineList = ({ events, loading, error }: TimelineListProps) => {
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
        <TimelineEvent key={event.id} event={event} />
      ))}
    </div>
  );
};

export default TimelineList;
