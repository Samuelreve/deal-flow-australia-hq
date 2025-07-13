
import { useState, useEffect } from 'react';
import { dealsService, Deal } from '@/services/dealsService';
import { useAuth } from '@/contexts/AuthContext';

export const useDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchDeals();
    }
  }, [isAuthenticated]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const dealsData = await dealsService.getDeals();
      setDeals(dealsData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch deals:', err);
      setError('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const createDeal = async (dealData: Partial<Deal>) => {
    try {
      const newDeal = await dealsService.createDeal(dealData);
      setDeals(prev => [newDeal, ...prev]);
      return newDeal;
    } catch (err) {
      console.error('Failed to create deal:', err);
      throw err;
    }
  };

  const deleteDeal = async (dealId: string) => {
    try {
      await dealsService.deleteDeal(dealId);
      setDeals(prev => prev.filter(deal => deal.id !== dealId));
    } catch (err) {
      console.error('Failed to delete deal:', err);
      throw err;
    }
  };

  // Calculate metrics from real data
  const metrics = {
    total: deals.length,
    active: deals.filter(d => d.status === 'active').length,
    completed: deals.filter(d => d.status === 'completed').length,
    draft: deals.filter(d => d.status === 'draft').length,
    averageHealthScore: deals.length > 0 
      ? Math.round(deals.reduce((sum, deal) => sum + deal.health_score, 0) / deals.length)
      : 0
  };

  return {
    deals,
    loading,
    error,
    metrics,
    createDeal,
    deleteDeal,
    refreshDeals: fetchDeals
  };
};
