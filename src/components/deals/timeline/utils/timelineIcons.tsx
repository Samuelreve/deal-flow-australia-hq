
import { 
  FileText, 
  Users, 
  CheckCircle, 
  Calendar, 
  MessageCircle, 
  MessageSquare
} from "lucide-react";

export const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'deal_created':
      return <Calendar className="h-5 w-5" />;
    case 'milestone_completed':
      return <CheckCircle className="h-5 w-5" />;
    case 'document_uploaded':
      return <FileText className="h-5 w-5" />;
    case 'participant_added':
      return <Users className="h-5 w-5" />;
    case 'comment_added':
      return <MessageCircle className="h-5 w-5" />;
    case 'message_sent':
      return <MessageSquare className="h-5 w-5" />;
    default:
      return <Calendar className="h-5 w-5" />;
  }
};
