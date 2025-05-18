
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationFiltersProps {
  filterStatus: 'all' | 'read' | 'unread';
  filterType: 'all' | string;
  onStatusChange: (status: 'all' | 'read' | 'unread') => void;
  onTypeChange: (type: string) => void;
  onItemsPerPageChange: (items: string) => void;
  itemsPerPage: number;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filterStatus,
  filterType,
  onStatusChange,
  onTypeChange,
  onItemsPerPageChange,
  itemsPerPage,
}) => {
  // Helper function to get notification types for filter dropdown
  const getNotificationTypes = () => {
    const types = [
      { value: 'all', label: 'All Types' },
      { value: 'milestone_status_updated', label: 'Milestone Updates' },
      { value: 'document_uploaded', label: 'Document Uploads' },
      { value: 'message_added', label: 'Messages' },
      { value: 'participant_added', label: 'Participant Added' },
      { value: 'deal_status_changed', label: 'Deal Status Changes' }
    ];
    return types;
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Filter */}
      <Select
        value={filterStatus}
        onValueChange={(value) => onStatusChange(value as 'all' | 'read' | 'unread')}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="unread">Unread</SelectItem>
          <SelectItem value="read">Read</SelectItem>
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select
        value={filterType}
        onValueChange={onTypeChange}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          {getNotificationTypes().map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Items per page */}
      <Select
        value={itemsPerPage.toString()}
        onValueChange={onItemsPerPageChange}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Items per page" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5 per page</SelectItem>
          <SelectItem value="10">10 per page</SelectItem>
          <SelectItem value="20">20 per page</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default NotificationFilters;
