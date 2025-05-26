
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchDealsFromSupabase } from './deals/fetchDeals';
import { DealSummary } from '@/types/deal';

interface DealsMetrics {
  total: number;
  active: number;
  completed: number;
  draft: number;
  averageHealthScore: number;
}

export function useDeals() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = async () => {
    if (!user?.id) {
      setDeals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedDeals = await fetchDealsFromSupabase(user.id);
      setDeals(fetchedDeals);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch deals:', err);
      setError(err.message || 'Failed to fetch deals');
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [user?.id]);

  // Calculate metrics
  const metrics: DealsMetrics = {
    total: deals.length,
    active: deals.filter(deal => deal.status === 'active').length,
    completed: deals.filter(deal => deal.status === 'completed').length,
    draft: deals.filter(deal => deal.status === 'draft').length,
    averageHealthScore: deals.length > 0 
      ? Math.round(deals.reduce((sum, deal) => sum + deal.healthScore, 0) / deals.length)
      : 0
  };

  return {
    deals,
    loading,
    error,
    metrics,
    refetch: fetchDeals
  };
}
