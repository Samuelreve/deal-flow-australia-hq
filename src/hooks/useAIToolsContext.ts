
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Types for deals and documents
export interface DealSummary {
  id: string;
  title: string;
  business_name: string;
  status: string;
}

export interface DocumentSummary {
  id: string;
  name: string;
  versionId: string; 
}

export function useAIToolsContext(isOpen: boolean, userId: string) {
  // Data states
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [clauseText, setClauseText] = useState<string>('');

  // Fetch deals when modal opens
  useEffect(() => {
    const fetchDeals = async () => {
      if (!isOpen || !userId) return;
      
      setLoadingDeals(true);
      try {
        const { data, error } = await supabase
          .from('deals')
          .select('id, title, business_name, status')
          .order('updated_at', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        setDeals(data as DealSummary[]);
      } catch (error) {
        console.error('Error fetching deals:', error);
        toast({
          title: 'Failed to load deals',
          description: 'Please try again later',
          variant: 'destructive'
        });
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
            document_versions (id, version_number)
          `)
          .eq('deal_id', selectedDealId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Map to format we need with latest version ID
        const docsWithVersions = (data || []).map(doc => ({
          id: doc.id,
          name: doc.name,
          versionId: doc.document_versions?.[0]?.id || ''
        })).filter(doc => doc.versionId);
        
        setDocuments(docsWithVersions);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: 'Failed to load documents',
          description: 'Please try again later',
          variant: 'destructive'
        });
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
      setSelectedDealId('');
      setSelectedDocumentId('');
      setSelectedVersionId('');
      setClauseText('');
    }
  }, [isOpen]);

  return {
    deals,
    documents,
    loadingDeals,
    loadingDocs,
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
