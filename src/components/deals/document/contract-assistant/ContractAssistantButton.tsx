
import React from 'react';
import { Button } from "@/components/ui/button";
import { Brain, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface ContractAssistantButtonProps {
  onClick: () => void;
  aiConnectionStatus: 'checking' | 'connected' | 'error';
  className?: string;
}

const ContractAssistantButton: React.FC<ContractAssistantButtonProps> = ({
  onClick,
  aiConnectionStatus,
  className
}) => {
  const getConnectionStatusIcon = () => {
    switch (aiConnectionStatus) {
      case 'checking':
        return <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />;
      case 'connected':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
    }
  };

  return (
    <Button 
      variant="outline"
      onClick={onClick}
      className={`gap-2 ${className || ''}`}
      size="sm"
      disabled={aiConnectionStatus === 'error'}
    >
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4" />
        <span>Contract Assistant</span>
        {getConnectionStatusIcon()}
      </div>
    </Button>
  );
};

export default ContractAssistantButton;
