
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Wifi, WifiOff } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DealSummary } from '@/types/deal';

interface RealTimeHealthMonitorProps {
  deals: DealSummary[];
  onHealthScoreUpdate: (dealId: string, newScore: number) => void;
}

const RealTimeHealthMonitor: React.FC<RealTimeHealthMonitorProps> = ({ 
  deals, 
  onHealthScoreUpdate 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeUpdates, setRealtimeUpdates] = useState<Array<{
    id: string;
    dealId: string;
    dealTitle: string;
    oldScore: number;
    newScore: number;
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    // Set up real-time subscription for deal health changes
    const channel = supabase
      .channel('health-monitoring')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deals',
          filter: 'health_score=neq.null'
        },
        (payload: any) => {
          console.log('Real-time health score update:', payload);
          
          const { new: newDeal, old: oldDeal } = payload;
          const deal = deals.find(d => d.id === newDeal.id);
          
          if (deal && newDeal.health_score !== oldDeal.health_score) {
            // Add to updates list
            const update = {
              id: `${newDeal.id}-${Date.now()}`,
              dealId: newDeal.id,
              dealTitle: deal.title,
              oldScore: oldDeal.health_score,
              newScore: newDeal.health_score,
              timestamp: new Date()
            };
            
            setRealtimeUpdates(prev => [update, ...prev.slice(0, 9)]);
            
            // Call parent callback
            onHealthScoreUpdate(newDeal.id, newDeal.health_score);
            
            // Show toast notification
            const scoreDiff = newDeal.health_score - oldDeal.health_score;
            const isImprovement = scoreDiff > 0;
            
            toast(
              `${deal.title}: Health score ${isImprovement ? 'improved' : 'declined'} to ${newDeal.health_score}%`,
              {
                description: `${isImprovement ? '+' : ''}${scoreDiff}% change`,
                duration: 5000
              }
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deal_health_alerts'
        },
        (payload: any) => {
          console.log('New health alert:', payload);
          
          const alert = payload.new;
          const deal = deals.find(d => d.id === alert.deal_id);
          
          if (deal) {
            toast.error(
              `Health Alert: ${deal.title}`,
              {
                description: alert.message,
                duration: 10000
              }
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deals, onHealthScoreUpdate]);

  const getScoreChangeColor = (oldScore: number, newScore: number) => {
    if (newScore > oldScore) return 'text-green-600';
    if (newScore < oldScore) return 'text-red-600';
    return 'text-gray-600';
  };

  const getScoreChangeBadge = (oldScore: number, newScore: number) => {
    const diff = newScore - oldScore;
    if (diff > 0) return <Badge className="bg-green-100 text-green-800">+{diff}%</Badge>;
    if (diff < 0) return <Badge className="bg-red-100 text-red-800">{diff}%</Badge>;
    return <Badge variant="outline">No change</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Real-Time Health Monitor
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Disconnected</span>
              </div>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Live updates for deal health score changes and alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {realtimeUpdates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Monitoring for real-time health updates...</p>
            <p className="text-sm">Changes will appear here as they happen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {realtimeUpdates.map((update) => (
              <div key={update.id} className="border rounded-lg p-3 bg-muted/30">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium">{update.dealTitle}</div>
                  <div className="text-xs text-muted-foreground">
                    {update.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={getScoreChangeColor(update.oldScore, update.newScore)}>
                      {update.oldScore}% → {update.newScore}%
                    </span>
                    {getScoreChangeBadge(update.oldScore, update.newScore)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 text-xs text-muted-foreground text-center">
          {isConnected 
            ? "Real-time monitoring active • Updates appear instantly"
            : "Connection lost • Attempting to reconnect..."
          }
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeHealthMonitor;
