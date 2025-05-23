
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HealthHistory } from '@/types/healthMonitoring';
import { DealSummary } from '@/types/deal';
import { toast } from 'sonner';

export const useHealthHistory = (dealId?: string) => {
  const [history, setHistory] = useState<HealthHistory[]>([]);
  const [deal, setDeal] = useState<DealSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!dealId) return;

    try {
      setLoading(true);

      // Fetch deal health history
      const { data: historyData, error: historyError } = await supabase
        .from('deal_health_history')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: true });

      if (historyError) throw historyError;
      
      // Fetch basic deal info
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select('id, title, health_score, status, business_legal_name')
        .eq('id', dealId)
        .single();

      if (dealError) throw dealError;
      
      // Format deal data
      const formattedDeal: DealSummary = {
        id: dealData.id,
        title: dealData.title,
        status: dealData.status,
        healthScore: dealData.health_score,
        createdAt: new Date(),
        updatedAt: new Date(),
        sellerId: '',
        businessName: dealData.business_legal_name || dealData.title
      };
      
      setDeal(formattedDeal);
      setHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching health history:', error);
      toast.error('Failed to load health history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [dealId]);

  return {
    history,
    deal,
    loading,
    refetch: fetchHistory
  };
};
