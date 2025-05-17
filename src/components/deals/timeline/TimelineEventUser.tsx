
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TimelineEvent } from "@/hooks/useTimelineEvents";

interface TimelineEventUserProps {
  user: NonNullable<TimelineEvent["user"]>;
}

const TimelineEventUser = ({ user }: TimelineEventUserProps) => {
  if (!user.name) return null;
  
  return (
    <span className="ml-2 flex items-center gap-1 mt-1">
      <span>by</span>
      <Avatar className="h-5 w-5 mr-1">
        <AvatarImage 
          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`} 
          alt={user.name} 
        />
        <AvatarFallback>{user.name[0]?.toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
      <span>{user.name}</span>
    </span>
  );
};

export default TimelineEventUser;
