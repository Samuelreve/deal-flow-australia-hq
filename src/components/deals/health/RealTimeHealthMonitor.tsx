
import React from 'react';
import RealTimeHealthDashboard from '@/components/health/RealTimeHealthDashboard';
import HealthNotificationCenter from '@/components/health/HealthNotificationCenter';
import { DealSummary } from '@/types/deal';
import { useAuth } from '@/contexts/AuthContext';

interface RealTimeHealthMonitorProps {
  deals: DealSummary[];
  onHealthScoreUpdate: (dealId: string, newScore: number) => void;
}

const RealTimeHealthMonitor: React.FC<RealTimeHealthMonitorProps> = ({ 
  deals, 
  onHealthScoreUpdate 
}) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <RealTimeHealthDashboard
        deals={deals}
        userId={user?.id}
        onHealthScoreUpdate={onHealthScoreUpdate}
      />
      
      <HealthNotificationCenter userId={user?.id} />
    </div>
  );
};

export default RealTimeHealthMonitor;
