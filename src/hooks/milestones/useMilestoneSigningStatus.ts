import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SigningStatusResult {
  signingStatus: 'not_started' | 'sent' | 'completed';
  signatureRecords: any[];
  loading: boolean;
  userHasSigned: boolean;
  adminHasSigned: boolean;
  pendingSigners: string[];
}

export const useMilestoneSigningStatus = (milestoneId: string, dealId: string, userEmail?: string) => {
  const [signingStatus, setSigningStatus] = useState<'not_started' | 'sent' | 'completed'>('not_started');
  const [signatureRecords, setSignatureRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userHasSigned, setUserHasSigned] = useState(false);
  const [adminHasSigned, setAdminHasSigned] = useState(false);
  const [pendingSigners, setPendingSigners] = useState<string[]>([]);
  const { toast } = useToast();

  const checkSigningStatus = async () => {
    if (!milestoneId || !dealId) return;
    
    setLoading(true);
    try {
      // Get documents for this milestone
      const { data: milestoneDocuments, error: docsError } = await supabase
        .from('documents')
        .select('id')
        .eq('milestone_id', milestoneId);

      if (docsError) {
        console.error('Error fetching milestone documents:', docsError);
        return;
      }

      if (!milestoneDocuments || milestoneDocuments.length === 0) {
        setSigningStatus('not_started');
        setSignatureRecords([]);
        return;
      }

      const documentIds = milestoneDocuments.map(doc => doc.id);

      // Check signatures for these documents with signer details
      const { data: signatures, error: sigError } = await supabase
        .from('document_signatures')
        .select(`
          *,
          profiles:signer_email (name, role)
        `)
        .eq('deal_id', dealId)
        .in('document_id', documentIds)
        .order('created_at', { ascending: false });

      if (sigError) {
        console.error('Error checking signatures:', sigError);
        return;
      }

      setSignatureRecords(signatures || []);

      if (!signatures || signatures.length === 0) {
        setSigningStatus('not_started');
        setUserHasSigned(false);
        setAdminHasSigned(false);
        setPendingSigners([]);
        return;
      }

      // Check individual signing status
      const userSigned = userEmail ? signatures.some(sig => 
        sig.status === 'completed' && sig.signer_email === userEmail
      ) : false;

      const adminSigned = signatures.some(sig => 
        sig.status === 'completed' && sig.signer_role === 'admin'
      );

      const pendingSignatures = signatures.filter(sig => sig.status === 'sent').map(sig => sig.signer_email);

      setUserHasSigned(userSigned);
      setAdminHasSigned(adminSigned);
      setPendingSigners(pendingSignatures);

      // Check status - if any are completed, consider milestone signing completed
      const hasCompleted = signatures.some(sig => sig.status === 'completed');
      const hasSent = signatures.some(sig => sig.status === 'sent');

      if (hasCompleted) {
        setSigningStatus('completed');
      } else if (hasSent) {
        setSigningStatus('sent');
      } else {
        setSigningStatus('not_started');
      }

    } catch (error) {
      console.error('Error checking milestone signing status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSigningStatus();
  }, [milestoneId, dealId, userEmail]);

  // Listen for real-time changes to document_signatures table
  useEffect(() => {
    if (!dealId || !milestoneId) return;

    const channel = supabase
      .channel('milestone-signing-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_signatures',
          filter: `deal_id=eq.${dealId}`
        },
        (payload) => {
          console.log('Signature status changed:', payload);
          
          // Show toast notification based on the change
          if (payload.eventType === 'UPDATE' && payload.new) {
            const newStatus = payload.new.status;
            const oldStatus = payload.old?.status;
            
            if (newStatus !== oldStatus) {
              if (newStatus === 'completed') {
                toast({
                  title: 'Document Signed',
                  description: 'A milestone document has been signed successfully.',
                });
              } else if (newStatus === 'sent') {
                toast({
                  title: 'Document Sent for Signing',
                  description: 'A milestone document has been sent for signing.',
                });
              }
            }
          }
          
          // Refresh status after a short delay
          setTimeout(() => {
            checkSigningStatus();
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId, milestoneId, toast]);

  return {
    signingStatus,
    signatureRecords,
    loading,
    userHasSigned,
    adminHasSigned,
    pendingSigners,
    refreshStatus: checkSigningStatus
  } as SigningStatusResult & { refreshStatus: () => Promise<void> };
};