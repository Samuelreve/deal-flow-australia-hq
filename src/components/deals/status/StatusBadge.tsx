
import { cn } from "@/lib/utils";
import { DealStatus } from "@/types/deal";

interface StatusBadgeProps {
  status: DealStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-200 text-gray-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Badge className={cn(getStatusClass(status), className)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
