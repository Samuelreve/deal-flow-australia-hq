
import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface AIConnectionManagerProps {
  summarizeContract: any;
  explainContractClause: any;
  onStatusChange: (status: 'checking' | 'connected' | 'error') => void;
}

const AIConnectionManager: React.FC<AIConnectionManagerProps> = ({
  summarizeContract,
  explainContractClause,
  onStatusChange
}) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    const testAIConnection = async () => {
      try {
        setStatus('checking');
        onStatusChange('checking');
        
        if (summarizeContract && explainContractClause) {
          setStatus('connected');
          onStatusChange('connected');
          console.log('✅ Smart Contract Assistant: AI services connected successfully');
        } else {
          throw new Error('AI services not available');
        }
      } catch (error) {
        console.error('❌ Smart Contract Assistant: AI connection failed', error);
        setStatus('error');
        onStatusChange('error');
      }
    };

    testAIConnection();
  }, [summarizeContract, explainContractClause, onStatusChange]);

  const getConnectionStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />;
      case 'connected':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Connecting to AI...';
      case 'connected':
        return 'AI Ready';
      case 'error':
        return 'AI Unavailable';
    }
  };

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
      {getConnectionStatusIcon()}
      <span>{getConnectionStatusText()}</span>
    </div>
  );
};

export default AIConnectionManager;
