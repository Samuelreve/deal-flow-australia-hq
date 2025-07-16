import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DealContext {
  deal?: any;
  milestones?: any[];
  documents?: any[];
  participants?: any[];
  comments?: any[];
  healthHistory?: any[];
  loading: boolean;
  error: string | null;
}

export const useDealContext = (dealId: string) => {
  const [context, setContext] = useState<DealContext>({
    loading: true,
    error: null
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!dealId) return;
    
    fetchDealContext();
  }, [dealId]);

  const fetchDealContext = async () => {
    try {
      setContext(prev => ({ ...prev, loading: true, error: null }));

      // Fetch deal basic info
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();

      if (dealError) throw dealError;

      // Fetch milestones
      const { data: milestones, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .eq('deal_id', dealId)
        .order('order_index');

      if (milestonesError) console.warn('Error fetching milestones:', milestonesError);

      // Fetch documents
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select(`
          *,
          latest_version:document_versions(*)
        `)
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (documentsError) console.warn('Error fetching documents:', documentsError);

      // Fetch participants
      const { data: participants, error: participantsError } = await supabase
        .from('deal_participants')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('deal_id', dealId);

      if (participantsError) console.warn('Error fetching participants:', participantsError);

      // Fetch recent comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(name)
        `)
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (commentsError) console.warn('Error fetching comments:', commentsError);

      // Fetch health history
      const { data: healthHistory, error: healthError } = await supabase
        .from('deal_health_history')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (healthError) console.warn('Error fetching health history:', healthError);

      setContext({
        deal,
        milestones: milestones || [],
        documents: documents || [],
        participants: participants || [],
        comments: comments || [],
        healthHistory: healthHistory || [],
        loading: false,
        error: null
      });

    } catch (error: any) {
      console.error('Error fetching deal context:', error);
      setContext(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load deal context'
      }));
      
      toast({
        title: "Warning",
        description: "Some deal information may not be available for AI analysis",
        variant: "default"
      });
    }
  };

  return context;
};