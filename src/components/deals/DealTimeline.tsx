
import { Deal } from "@/types/deal";
import { useTimelineEvents } from "@/hooks/useTimelineEvents";
import TimelineList from "./timeline/TimelineList";

interface DealTimelineProps {
  deal: Deal;
}

const DealTimeline = ({ deal }: DealTimelineProps) => {
  const { events, loading, error } = useTimelineEvents(deal);

  return (
    <div className="space-y-4">
      <TimelineList events={events} loading={loading} error={error} />
    </div>
  );
};

export default DealTimeline;
