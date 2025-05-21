
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { DealSummary } from '@/types/deal';

// Types for deals and documents
export interface DocumentSummary {
  id: string;
  name: string;
  latestVersionId?: string;
}

export function useAIToolsContext(isOpen: boolean, userId: string) {
  // Data states
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [clauseText, setClauseText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch deals when modal opens
  useEffect(() => {
    const fetchDeals = async () => {
      if (!isOpen || !userId) return;
      
      setLoadingDeals(true);
      setErrorMessage(null);
      try {
        const { data, error } = await supabase
          .from('deals')
          .select('id, title, business_name, status, created_at, updated_at, health_score, seller_id, buyer_id')
          .order('updated_at', { ascending: false })
          .limit(20);
          
        if (error) {
          throw error;
        }
        
        if (!data || !Array.isArray(data)) {
          setDeals([]);
          return;
        }
        
        // Map to DealSummary type with proper field mapping
        const mappedDeals: DealSummary[] = data.map(deal => ({
          id: deal.id,
          title: deal.title,
          businessName: deal.business_name,
          status: deal.status,
          createdAt: deal.created_at,
          updatedAt: deal.updated_at,
          healthScore: deal.health_score,
          sellerId: deal.seller_id,
          buyerId: deal.buyer_id || '',
          // Add additional fields if required by DealSummary
        }));
        
        setDeals(mappedDeals);
      } catch (error: any) {
        console.error('Error fetching deals:', error);
        setErrorMessage('Failed to load deals. Please try again later.');
        toast({
          title: 'Failed to load deals',
          description: 'Please try again later',
          variant: 'destructive'
        });
        
        // Set an empty array to avoid undefined errors
        setDeals([]);
      } finally {
        setLoadingDeals(false);
      }
    };

    fetchDeals();
  }, [isOpen, userId]);

  // Fetch documents when a deal is selected
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!selectedDealId) {
        setDocuments([]);
        return;
      }
      
      setLoadingDocs(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select(`
            id,
            name,
            latest_version_id
          `)
          .eq('deal_id', selectedDealId)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (!data || !Array.isArray(data)) {
          setDocuments([]);
          return;
        }
        
        // Map to DocumentSummary
        const mappedDocs: DocumentSummary[] = data.map(doc => ({
          id: doc.id,
          name: doc.name,
          latestVersionId: doc.latest_version_id
        })).filter(doc => doc.latestVersionId);
        
        setDocuments(mappedDocs);
      } catch (error: any) {
        console.error('Error fetching documents:', error);
        setErrorMessage('Failed to load documents. Please try again later.');
        toast({
          title: 'Failed to load documents',
          description: 'Please try again later',
          variant: 'destructive'
        });
        
        // Set an empty array to avoid undefined errors
        setDocuments([]);
      } finally {
        setLoadingDocs(false);
      }
    };

    if (selectedDealId) {
      fetchDocuments();
    }
  }, [selectedDealId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDealId(null);
      setSelectedDocumentId(null);
      setSelectedVersionId(null);
      setClauseText('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  return {
    deals,
    documents,
    loadingDeals,
    loadingDocs,
    errorMessage,
    selectedDealId,
    setSelectedDealId,
    selectedDocumentId,
    setSelectedDocumentId,
    selectedVersionId,
    setSelectedVersionId,
    clauseText,
    setClauseText
  };
}
