
import { FileText, Users, MessageSquare, PackageCheck } from "lucide-react";
import { TimelineEvent } from "@/hooks/useTimelineEvents";

export const getEventIcon = (type: TimelineEvent["type"]) => {
  switch (type) {
    case "milestone_completed":
      return <PackageCheck className="h-5 w-5" />;
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
