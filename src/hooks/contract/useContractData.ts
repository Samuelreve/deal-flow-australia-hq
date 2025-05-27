
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentMetadata } from '@/types/contract';
import { toast } from 'sonner';

export const useContractData = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [contractText, setContractText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data: contractsData, error: contractsError } = await supabase
          .from('contracts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (contractsError) {
          throw contractsError;
        }

        if (contractsData && contractsData.length > 0) {
          const mappedDocuments: DocumentMetadata[] = contractsData.map(contract => ({
            id: contract.id,
            name: contract.name,
            type: contract.mime_type || 'application/octet-stream',
            uploadDate: contract.created_at,
            status: contract.analysis_status as 'pending' | 'analyzing' | 'completed' | 'error',
            version: '1.0',
            versionDate: contract.updated_at,
            size: contract.file_size,
            category: 'contract'
          }));

          setDocuments(mappedDocuments);
          
          if (mappedDocuments.length > 0) {
            const firstDoc = mappedDocuments[0];
            setSelectedDocument(firstDoc);
            await loadContractContent(firstDoc.id);
          }
        }
      } catch (error: any) {
        console.error('Error fetching contracts:', error);
        setError(error.message || 'Failed to load contracts');
        toast.error('Failed to load contracts');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user]);

  const loadContractContent = async (contractId: string) => {
    try {
      setLoading(true);
      
      const { data: contractData } = await supabase
        .from('contracts')
        .select('content, name')
        .eq('id', contractId)
        .single();

      if (contractData?.content) {
        setContractText(contractData.content);
      } else {
        setContractText('Contract content is being processed...');
      }
    } catch (error) {
      console.error('Error loading contract content:', error);
      toast.error('Failed to load contract content');
    } finally {
      setLoading(false);
    }
  };

  return {
    documents,
    selectedDocument,
    contractText,
    loading,
    error,
    setDocuments,
    setSelectedDocument,
    setContractText,
    setError,
    loadContractContent
  };
};
