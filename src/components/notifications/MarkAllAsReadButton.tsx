
import React from 'react';
import { MailOpen, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface MarkAllAsReadButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

const MarkAllAsReadButton: React.FC<MarkAllAsReadButtonProps> = ({ 
  onClick, 
  disabled, 
  loading 
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant="outline"
      size="sm" 
      className={`flex items-center gap-2 ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MailOpen className="h-4 w-4" />
      )}
      Mark All as Read
    </Button>
  );
};

export default MarkAllAsReadButton;
