
import { useState, useEffect } from 'react';
import { dealsService, Deal } from '@/services/dealsService';
import { useAuth } from '@/contexts/AuthContext';

interface PaginationOptions {
  page: number;
  limit: number;
}

export const useDeals = (pagination?: PaginationOptions) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchDeals();
    }
  }, [isAuthenticated, pagination?.page, pagination?.limit]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const result = await dealsService.getDeals(pagination);
      setDeals(result.deals);
      setTotalCount(result.totalCount);
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
      setTotalCount(prev => prev + 1);
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
      setTotalCount(prev => prev - 1);
    } catch (err) {
      console.error('Failed to delete deal:', err);
      throw err;
    }
  };

  // Calculate metrics from real data
  const metrics = {
    total: totalCount,
    active: deals.filter(d => d.status === 'active').length,
    completed: deals.filter(d => d.status === 'completed').length,
    draft: deals.filter(d => d.status === 'draft').length,
    averageHealthScore: deals.length > 0 
      ? Math.round(deals.reduce((sum, deal) => sum + deal.health_score, 0) / deals.length)
      : 0
  };

  return {
    deals,
    totalCount,
    loading,
    error,
    metrics,
    createDeal,
    deleteDeal,
    refreshDeals: fetchDeals
  };
};
