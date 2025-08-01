import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SigningStatusResult {
  signingStatus: 'not_started' | 'sent' | 'partially_completed' | 'completed';
  signatureRecords: any[];
  loading: boolean;
  userHasSigned: boolean;
  adminHasSigned: boolean;
  pendingSigners: string[];
  assignedUsers: any[];
  hasOtherSignatures: boolean;
  signerNames: string[];
}

export const useMilestoneSigningStatus = (milestoneId: string, dealId: string, userEmail?: string) => {
  const [signingStatus, setSigningStatus] = useState<'not_started' | 'sent' | 'partially_completed' | 'completed'>('not_started');
  const [signatureRecords, setSignatureRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userHasSigned, setUserHasSigned] = useState(false);
  const [adminHasSigned, setAdminHasSigned] = useState(false);
  const [pendingSigners, setPendingSigners] = useState<string[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [hasOtherSignatures, setHasOtherSignatures] = useState(false);
  const [signerNames, setSignerNames] = useState<string[]>([]);
  const { toast } = useToast();

  const checkSigningStatus = async () => {
    if (!milestoneId || !dealId) return;
    
    setLoading(true);
    try {
      // Get assigned users for this milestone
      const { data: assignedUsersData, error: assignmentError } = await supabase
        .from('milestone_assignments')
        .select(`
          user_id,
          profiles:user_id (
            name,
            email
          )
        `)
        .eq('milestone_id', milestoneId);

      if (assignmentError) {
        console.error('Error fetching assigned users:', assignmentError);
      }

      setAssignedUsers(assignedUsersData || []);

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
        setHasOtherSignatures(false);
        setSignerNames([]);
        return;
      }

      const documentIds = milestoneDocuments.map(doc => doc.id);

      // Check signatures for these documents
      const { data: signatures, error: sigError } = await supabase
        .from('document_signatures')
        .select('*')
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
        setHasOtherSignatures(false);
        setSignerNames([]);
        return;
      }

      // Check individual signing status
      const userSigned = userEmail ? signatures.some(sig => 
        (sig.status === 'completed' || sig.status === 'partially_completed') && sig.signer_email === userEmail
      ) : false;

      const adminSigned = signatures.some(sig => 
        (sig.status === 'completed' || sig.status === 'partially_completed') && sig.signer_role === 'admin'
      );

      const completedSignatures = signatures.filter(sig => sig.status === 'completed' || sig.status === 'partially_completed');
      const pendingSignatures = signatures.filter(sig => sig.status === 'sent').map(sig => sig.signer_email);

      // Check if there are other completed signatures (not by current user)
      const otherCompletedSignatures = completedSignatures.filter(sig => 
        sig.signer_email !== userEmail
      );

      // Get names of people who have signed
      const signedEmails = completedSignatures.map(sig => sig.signer_email);
      const signerNamesList: string[] = [];
      
      // Map emails to names from assigned users
      if (assignedUsersData) {
        assignedUsersData.forEach(assignedUser => {
          if (signedEmails.includes(assignedUser.profiles?.email)) {
            signerNamesList.push(assignedUser.profiles?.name || assignedUser.profiles?.email || 'Unknown');
          }
        });
      }

      setUserHasSigned(userSigned);
      setAdminHasSigned(adminSigned);
      setPendingSigners(pendingSignatures);
      setHasOtherSignatures(otherCompletedSignatures.length > 0);
      setSignerNames(signerNamesList);

      // Check status - envelope completed vs individual completed
      const hasEnvelopeCompleted = signatures.some(sig => sig.status === 'completed');
      const hasPartiallyCompleted = signatures.some(sig => sig.status === 'partially_completed');
      const hasSent = signatures.some(sig => sig.status === 'sent');

      if (hasEnvelopeCompleted) {
        setSigningStatus('completed');
      } else if (hasPartiallyCompleted) {
        setSigningStatus('partially_completed');
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

    const signatureChannel = supabase
      .channel(`milestone-signing-status-${milestoneId}`)
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
                  title: 'Document Fully Signed! ✅',
                  description: 'All parties have signed the milestone document. The document is now complete.',
                });
              } else if (newStatus === 'partially_completed') {
                toast({
                  title: 'Document Partially Signed',
                  description: 'One party has signed the document. Waiting for other signatures.',
                });
              } else if (newStatus === 'sent') {
                toast({
                  title: 'Document Sent for Signing',
                  description: 'A milestone document has been sent for signing.',
                });
              }
            }
          }
          
          // Immediately refresh status for real-time updates
          checkSigningStatus();
        }
      )
      .subscribe();

    // Also listen for document uploads to this milestone
    const documentChannel = supabase
      .channel(`milestone-documents-${milestoneId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `milestone_id=eq.${milestoneId}`
        },
        (payload) => {
          console.log('Document change for milestone:', payload);
          
          // Refresh status when documents are added/removed from this milestone
          setTimeout(() => {
            checkSigningStatus();
          }, 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(signatureChannel);
      supabase.removeChannel(documentChannel);
    };
  }, [dealId, milestoneId, toast]);

  return {
    signingStatus,
    signatureRecords,
    loading,
    userHasSigned,
    adminHasSigned,
    pendingSigners,
    assignedUsers,
    hasOtherSignatures,
    signerNames,
    refreshStatus: checkSigningStatus
  } as SigningStatusResult & { refreshStatus: () => Promise<void> };
};