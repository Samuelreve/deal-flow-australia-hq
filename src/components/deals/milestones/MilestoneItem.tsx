import React, { useState, useEffect } from 'react';
import { Milestone, MilestoneStatus } from '@/types/deal';
import { useMilestoneHelpers } from './useMilestoneHelpers';
import { useAuth } from '@/contexts/AuthContext';
import { useMilestoneSigningStatus } from '@/hooks/milestones/useMilestoneSigningStatus';
import MilestoneExplainButton from './MilestoneExplainButton';
import DocumentSigningStatus from './DocumentSigningStatus';

import SignaturePositioningModal from './SignaturePositioningModal';
import MilestoneAssignmentModal from './MilestoneAssignmentModal';
import MilestoneDocumentPreviewModal from './MilestoneDocumentPreviewModal';
import DocumentUpload from '../document/DocumentUpload';
import { FileText, UserCheck, User, Upload, CheckCircle, Clock, FileCheck, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getDocumentTypeForSigning } from '@/utils/fileUtils';

interface MilestoneItemProps {
  milestone: Milestone;
  userRole: string;
  updatingMilestoneId: string | null;
  onUpdateStatus: (milestoneId: string, newStatus: MilestoneStatus) => void;
  isParticipant?: boolean;
  dealId: string;
  canStart?: boolean;
  previousMilestone?: Milestone | null;
  onMilestoneUpdated?: () => void;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({ 
  milestone, 
  userRole, 
  updatingMilestoneId, 
  onUpdateStatus,
  isParticipant = true,
  dealId,
  canStart = true,
  previousMilestone,
  onMilestoneUpdated
}) => {
  const { getStatusColor, formatStatus, formatDate } = useMilestoneHelpers();
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    signingStatus: milestoneSigningStatus, 
    loading: signingStatusLoading, 
    userHasSigned, 
    adminHasSigned, 
    pendingSigners,
    assignedUsers,
    hasOtherSignatures,
    signerNames
  } = useMilestoneSigningStatus(milestone.id, dealId, user?.email);
  
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{id: string, url: string, name: string} | null>(null);
  const [signers, setSigners] = useState<Array<{email: string, name: string, recipientId: string}>>([]);
  const [signingInProgress, setSigningInProgress] = useState(false);
  const [downloadingSignedDoc, setDownloadingSignedDoc] = useState(false);
  const [documentSaved, setDocumentSaved] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [milestoneDocuments, setMilestoneDocuments] = useState<any[]>([]);
  const [savedSignedDocuments, setSavedSignedDocuments] = useState<Set<string>>(new Set());
  const [milestoneMessages, setMilestoneMessages] = useState<string[]>([]);
  const [previewDocument, setPreviewDocument] = useState<{id: string, name: string, storage_path: string} | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  // Admin can always update, assigned user can update, or seller can update unassigned milestones
  const canUpdateMilestone = isParticipant && (
    ['admin'].includes(userRole.toLowerCase()) || 
    (milestone.assigned_to === user?.id) ||
    (!milestone.assigned_to && ['seller'].includes(userRole.toLowerCase()))
  );
  
  // Permission to START milestones (admins only)
  const canStartMilestone = isParticipant && ['admin'].includes(userRole.toLowerCase());
  
  // Permission to assign/unassign milestones (sellers and admins only)
  const canAssignMilestone = isParticipant && ['admin', 'seller'].includes(userRole.toLowerCase());
  
  // Permission to upload documents for milestones (admins only)
  const canUploadMilestoneDocuments = isParticipant && ['admin'].includes(userRole.toLowerCase());
  
  // Permission to sign milestone documents (assigned users and admins)
  const canSignMilestoneDocuments = isParticipant && (milestone.assigned_to === user?.id || ['admin'].includes(userRole.toLowerCase())) && milestoneDocuments.length > 0;
  
  // Check if this is the "Document Signing" milestone
  const isDocumentSigning = milestone.title.toLowerCase().includes('document signing');
  
  // Only show sign button for non-assigned users in "Document Signing" milestone
  const showSignButton = isDocumentSigning && 
    ['buyer', 'seller', 'lawyer', 'admin'].includes(userRole.toLowerCase()) &&
    milestone.status === 'in_progress' &&
    milestone.assigned_to !== user?.id;
  
  // Fetch milestone-specific documents and messages
  useEffect(() => {
    fetchMilestoneDocuments();
    fetchMilestoneMessages();
    
    // Set up real-time listener for milestone documents changes
    const documentChannel = supabase
      .channel(`milestone-docs-${milestone.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `milestone_id=eq.${milestone.id}`
        },
        (payload) => {
          // Real-time document change detected
          fetchMilestoneDocuments(); // Refresh documents when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(documentChannel);
    };
    
    // Load saved signed documents from localStorage
    loadSavedSignedDocuments();
  }, [milestone.id]);

  // Load saved signed documents from localStorage
  const loadSavedSignedDocuments = () => {
    try {
      const saved = localStorage.getItem(`savedSignedDocs_${dealId}`);
      if (saved) {
        const savedArray = JSON.parse(saved) as string[];
        const savedSet = new Set<string>(savedArray);
        setSavedSignedDocuments(savedSet);
      }
    } catch (error) {
      console.error('Error loading saved signed documents:', error);
    }
  };

  // Save to localStorage when a milestone document is saved
  const markMilestoneDocumentAsSaved = (milestoneId: string) => {
    try {
      const currentSaved = localStorage.getItem(`savedSignedDocs_${dealId}`);
      const savedArray = currentSaved ? JSON.parse(currentSaved) as string[] : [];
      const savedSet = new Set<string>(savedArray);
      savedSet.add(milestoneId);
      
      localStorage.setItem(`savedSignedDocs_${dealId}`, JSON.stringify([...savedSet]));
      setSavedSignedDocuments(new Set<string>(savedSet));
    } catch (error) {
      console.error('Error saving milestone document status:', error);
    }
  };

  // Use the milestone signing status from the hook instead of local checks

  const fetchMilestoneDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id,
          name,
          storage_path,
          created_at,
          uploaded_by,
          profiles!documents_uploaded_by_fkey(name)
        `)
        .eq('milestone_id', milestone.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMilestoneDocuments(data || []);
    } catch (error) {
      console.error('Error fetching milestone documents:', error);
    }
  };

  const fetchMilestoneMessages = async () => {
    try {
      const messages: string[] = [];
      
      // Don't show any signing messages if milestone is completed or document is fully signed
      if (milestone.status === 'completed') {
        setMilestoneMessages([]);
        return;
      }
      
      // Get documents uploaded for this milestone with uploader info
      const { data: docs, error } = await supabase
        .from('documents')
        .select(`
          name,
          created_at,
          uploaded_by,
          profiles!documents_uploaded_by_fkey(name, role)
        `)
        .eq('milestone_id', milestone.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      docs?.forEach(doc => {
        const uploaderName = doc.profiles?.name || 'Unknown User';
        const uploaderRole = doc.profiles?.role || '';
        const isAdmin = uploaderRole === 'admin';
        const isCurrentUser = doc.uploaded_by === user?.id;
        
        // Show message for assigned users or admin (current user) only if not completed
        if ((milestone.assigned_to === user?.id || (isCurrentUser && isAdmin)) && 
            (milestone.status as string) !== 'completed') {
          if (isCurrentUser && isAdmin) {
            // Admin who uploaded sees different message
            messages.push(`You uploaded document "${doc.name}" for this milestone`);
          } else {
            // Assigned user sees the original message only if not completed
            const roleText = isAdmin ? ' (Admin)' : '';
            messages.push(`${uploaderName}${roleText} uploaded document "${doc.name}" and please sign the document.`);
          }
        }
      });

      // Add signing status messages only if milestone not completed
      if ((milestone.status as string) !== 'completed') {
        if (milestoneSigningStatus === 'sent' && milestone.assigned_to === user?.id && !userHasSigned) {
          // Document has been sent for signing and assigned user hasn't signed yet
          messages.push(`Opposite has signed. Please check your email and sign the document.`);
        } else if (milestoneSigningStatus === 'partially_completed') {
          if (milestone.assigned_to === user?.id && !userHasSigned && signerNames.length > 0) {
            // Assigned user hasn't signed yet but others have
            const signerNamesText = signerNames.join(', ');
            messages.push(`Opposite signed, check your email and sign the document.`);
          }
        } else if (hasOtherSignatures && milestone.assigned_to === user?.id && !userHasSigned && signerNames.length > 0) {
          // Fallback for other signing status cases
          const signerNamesText = signerNames.join(', ');
          messages.push(`Check your email, ${signerNamesText} has signed. Please sign the document.`);
        }
      }

      setMilestoneMessages(messages);
    } catch (error) {
      console.error('Error fetching milestone messages:', error);
    }
  };

  const handleSignMilestoneDocument = async (documentId: string) => {
    // Directly sign the milestone document
    await handleDocumentSelected(documentId);
  };

  // Remove the local checkDocumentSignatures function - use the hook instead
  
  // Prevent completing Document Signing if documents aren't signed
  const canMarkAsCompleted = milestone.status === 'in_progress' && 
    (!isDocumentSigning || milestoneSigningStatus === 'completed');

  const handleSignDocument = async () => {
    console.log('Sign document clicked for milestone:', milestone.id, milestone.title);
    
    // Skip document selection modal and directly use milestone documents
    if (milestoneDocuments.length === 0) {
      toast({
        title: 'No documents',
        description: 'No documents found for this milestone',
        variant: 'destructive'
      });
      return;
    }

    // Use the first document for the milestone
    const documentToSign = milestoneDocuments[0];
    await handleDocumentSelected(documentToSign.id);
  };

  const handleDocumentSelected = async (documentId: string) => {
    if (!user) return;

    try {
      // Get document URL for positioning
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('storage_path, name')
        .eq('id', documentId)
        .single();

      if (docError || !document) {
        throw new Error('Failed to load document');
      }

      // Check document type to determine how to handle it
      const documentType = getDocumentTypeForSigning(document.name);
      
      let signedUrl: string;
      
      // Only handle PDF and convertible documents now (TXT support removed)
      
      // Try different path formats for the deal_documents bucket
      const pathsToTry = [
        document.storage_path,
        `${dealId}/${document.storage_path}`,
        document.storage_path.split('/').pop(), // Just the filename
      ];
      
      let urlData: { signedUrl: string } | null = null;
      
      for (const path of pathsToTry) {
        try {
          const result = await supabase.storage
            .from('deal_documents')
            .createSignedUrl(path, 3600);
          
          if (result.data?.signedUrl && !result.error) {
            urlData = result.data;
            break;
          }
        } catch (error) {
          // Failed to get signed URL for this path, try next
          continue;
        }
      }

      if (!urlData?.signedUrl) {
        throw new Error('Failed to generate document preview');
      }

      // Fetch all assigned users for this milestone
      const { data: assignedUsers, error: assignmentError } = await supabase
        .from('milestone_assignments')
        .select(`
          user_id,
          profiles:user_id (
            name,
            email
          )
        `)
        .eq('milestone_id', milestone.id);

      if (assignmentError) {
        console.error('Error fetching assigned users:', assignmentError);
      }

      // Fetch all deal participants (admin, buyer, lawyer, etc.)
      const { data: dealParticipants, error: participantsError } = await supabase
        .from('deal_participants')
        .select(`
          user_id,
          role,
          profiles:user_id (
            name,
            email
          )
        `)
        .eq('deal_id', dealId);

      if (participantsError) {
        console.error('Error fetching deal participants:', participantsError);
      }

      // Get deal information for buyer
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select('buyer_id')
        .eq('id', dealId)
        .single();

      if (dealError) {
        console.error('Error fetching deal data:', dealError);
      }

      // Get buyer profile separately if buyer exists
      let buyerProfile = null;
      if (dealData?.buyer_id) {
        const { data: buyerProfileData, error: buyerProfileError } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', dealData.buyer_id)
          .single();

        if (!buyerProfileError) {
          buyerProfile = buyerProfileData;
        }
      }

      const signersList: Array<{email: string, name: string, recipientId: string}> = [];
      let recipientIdCounter = 1;

      // Add assigned users
      if (assignedUsers) {
        assignedUsers.forEach(assignment => {
          if (assignment.profiles?.email) {
            signersList.push({
              email: assignment.profiles.email,
              name: assignment.profiles.name || assignment.profiles.email,
              recipientId: recipientIdCounter.toString()
            });
            recipientIdCounter++;
          }
        });
      }

      // Add admin participants
      if (dealParticipants) {
        dealParticipants.forEach(participant => {
          if (participant.role === 'admin' && participant.profiles?.email) {
            // Check if already added as assigned user
            const alreadyAdded = signersList.some(signer => signer.email === participant.profiles?.email);
            if (!alreadyAdded) {
              signersList.push({
                email: participant.profiles.email,
                name: participant.profiles.name || participant.profiles.email,
                recipientId: recipientIdCounter.toString()
              });
              recipientIdCounter++;
            }
          }
        });

        // Add lawyer participants
        dealParticipants.forEach(participant => {
          if (participant.role === 'lawyer' && participant.profiles?.email) {
            // Check if already added
            const alreadyAdded = signersList.some(signer => signer.email === participant.profiles?.email);
            if (!alreadyAdded) {
              signersList.push({
                email: participant.profiles.email,
                name: participant.profiles.name || participant.profiles.email,
                recipientId: recipientIdCounter.toString()
              });
              recipientIdCounter++;
            }
          }
        });
      }

      // Add buyer if exists and not already added
      if (dealData?.buyer_id && buyerProfile?.email) {
        const alreadyAdded = signersList.some(signer => signer.email === buyerProfile?.email);
        if (!alreadyAdded) {
          signersList.push({
            email: buyerProfile.email,
            name: buyerProfile.name || buyerProfile.email,
            recipientId: recipientIdCounter.toString()
          });
          recipientIdCounter++;
        }
      }

      // If no signers found, fall back to current user if they can sign
      if (signersList.length === 0 && canSignMilestoneDocuments) {
        const currentUserProfile = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        signersList.push({
          email: user.email!,
          name: currentUserProfile.data?.name || user.email!,
          recipientId: '1'
        });
      }

      // Set up for signature positioning
      setSelectedDocument({ id: documentId, url: urlData.signedUrl, name: document.name });
      setSigners(signersList);
      setIsSignatureModalOpen(true);

    } catch (error: any) {
      console.error('Error preparing document for positioning:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to prepare document',
        variant: 'destructive'
      });
    }
  };

  const initiateDocuSignSigning = async (documentId: string, signersList: Array<{email: string, name: string, recipientId: string}>) => {
    if (!user) return;

    setSigningInProgress(true);
    try {
      

      // Prepare signers with default positions (no positioning modal)
      const signersWithPositions = signersList.map(signer => ({
        ...signer,
        xPosition: '100',
        yPosition: '200',
        pageNumber: '1'
      }));
      
      // Find the current user in the signers list to get their correct name
      const currentUserSigner = signersList.find(signer => signer.email === user.email);
      const signerName = currentUserSigner?.name || user.email;
      
      
      // Call DocuSign edge function to initiate signing
      const { data, error } = await supabase.functions.invoke('docusign-sign', {
        body: {
          documentId: documentId,
          dealId,
          signerEmail: user.email,
          signerName,
          signerRole: userRole.toLowerCase(),
          buyerEmail: signersList[1]?.email,
          buyerName: signersList[1]?.name,
          signaturePositions: signersWithPositions
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        
        // Check if we have a signing URL for embedded signing
        if (data.signingUrl) {
          
          // Open DocuSign signing URL in current window for embedded signing
          window.location.href = data.signingUrl;
          
          toast({
            title: 'Redirecting to DocuSign',
            description: 'Opening DocuSign interface for signing...'
          });
        } else {
          // No signing URL - user will receive email invitation
          toast({
            title: 'Document sent for signing',
            description: 'All assigned signers will receive email invitations to sign the document.'
          });
        }

        // Status will be updated automatically via the hook's real-time subscription
      } else {
        console.error('DocuSign envelope creation failed');
        toast({
          title: 'Failed to initiate signing',
          description: 'There was an error creating the DocuSign envelope.',
          variant: 'destructive'
        });
      }

    } catch (error: any) {
      console.error('Error starting DocuSign process:', error);
      
      // Check if this is a consent required error
      if (error.message && error.message.startsWith('CONSENT_REQUIRED:')) {
        const consentUrl = error.message.split('CONSENT_REQUIRED:')[1];
        
        toast({
          title: 'DocuSign consent required',
          description: 'Opening consent page in new tab. Please grant consent and try again.',
        });
        
        window.open(consentUrl, '_blank');
        return;
      }
      
      toast({
        title: 'Signing failed',
        description: error.message || 'Failed to start document signing process',
        variant: 'destructive'
      });
    } finally {
      setSigningInProgress(false);
    }
  };

  const handleSignaturePositionsConfirmed = async (positions: Array<{x: number, y: number, page: number, recipientId: string, recipientName: string}>) => {
    if (!selectedDocument || !user) return;

    setSigningInProgress(true);
    try {
      

      // Prepare signers with positions
      const signersWithPositions = signers.map(signer => {
        const position = positions.find(p => p.recipientId === signer.recipientId);
        return {
          ...signer,
          xPosition: position?.x.toString() || '100',
          yPosition: position?.y.toString() || '200',
          pageNumber: position?.page.toString() || '1'
        };
      });
      
      // Find the current user in the signers list to get their correct name
      const currentUserSigner = signers.find(signer => signer.email === user.email);
      const signerName = currentUserSigner?.name || user.email;
      
      
      // Call DocuSign edge function to initiate signing
      const { data, error } = await supabase.functions.invoke('docusign-sign', {
        body: {
          documentId: selectedDocument.id,
          dealId,
          signerEmail: user.email,
          signerName,
          signerRole: userRole.toLowerCase(),
          buyerEmail: signers[1]?.email,
          buyerName: signers[1]?.name,
          signaturePositions: signersWithPositions
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        
        
        // Check if we have a signing URL for embedded signing
        if (data.signingUrl) {
          
          
          // Open DocuSign signing URL in current window for embedded signing
          window.location.href = data.signingUrl;
          
          toast({
            title: 'Redirecting to DocuSign',
            description: 'Opening DocuSign interface for signing...'
          });
        } else {
          // No signing URL - user will receive email invitation
          // No signing URL - email invitations will be sent
          toast({
            title: 'Document sent for signing',
            description: 'All assigned signers will receive email invitations to sign the document.'
          });
        }
        
        // Close the modals
        setIsSignatureModalOpen(false);
        setSelectedDocument(null);
        setSigners([]);

        // Status will be updated automatically via the hook's real-time subscription
      } else {
        console.error('DocuSign envelope creation failed');
        toast({
          title: 'Failed to initiate signing',
          description: 'There was an error creating the DocuSign envelope.',
          variant: 'destructive'
        });
      }

    } catch (error: any) {
      console.error('Error starting DocuSign process:', error);
      
      // Check if DocuSign authentication is required (from edge function response)
      const errorMessage = error.message || '';
      if (errorMessage.includes('DocuSign not connected') || errorMessage.includes('requiresAuth')) {
        toast({
          title: 'DocuSign Connection Required',
          description: 'Please connect your DocuSign account in Settings before signing documents.',
          variant: 'destructive'
        });
        return;
      }
      
      // Check if this is a consent required error
      if (errorMessage.startsWith('CONSENT_REQUIRED:')) {
        const consentUrl = errorMessage.split('CONSENT_REQUIRED:')[1];
        
        toast({
          title: 'DocuSign consent required',
          description: 'Opening consent page in new tab. Please grant consent and try again.',
        });
        
        window.open(consentUrl, '_blank');
        return;
      }
      
      toast({
        title: 'Signing failed',
        description: errorMessage || 'Failed to start document signing process',
        variant: 'destructive'
      });
    } finally {
      setSigningInProgress(false);
    }
  };

  const handleDownloadSignedDocument = async () => {
    if (!user) return;

    setDownloadingSignedDoc(true);
    let downloadedCount = 0;
    let errorCount = 0;
    let lastError = '';

    try {
      // Get signature records for this deal to find envelope IDs
      const { data: signatures, error: sigError } = await supabase
        .from('document_signatures')
        .select('envelope_id, status')
        .eq('deal_id', dealId)
        .eq('status', 'completed');

      if (sigError) {
        throw new Error('Failed to fetch signature records');
      }

      if (!signatures || signatures.length === 0) {
        throw new Error('No completed signatures found for this deal');
      }

      // Download signed documents for each completed envelope
      for (const signature of signatures) {
        
        
        const { data, error } = await supabase.functions.invoke('docusign-download-signed', {
          body: {
            envelopeId: signature.envelope_id,
            dealId,
            documentId: 'combined' // Download combined document
          }
        });

        // Check for error from invoke or from response data
        if (error) {
          console.error('Error downloading envelope:', signature.envelope_id, error);
          lastError = error.message || 'Unknown error';
          errorCount++;
          continue;
        }

        // Also check if response indicates failure
        if (data && !data.success) {
          console.error('Download failed for envelope:', signature.envelope_id, data.error);
          lastError = data.error || 'Download failed';
          errorCount++;
          continue;
        }

        
        downloadedCount++;
      }

      // Show appropriate toast based on results
      if (downloadedCount > 0) {
        toast({
          title: 'Success',
          description: `${downloadedCount} signed document(s) saved to Documents tab`,
        });

        // Mark document as saved
        setDocumentSaved(true);
        
        // Mark this milestone as having saved signed documents
        markMilestoneDocumentAsSaved(milestone.id);

        // Trigger refresh of documents list without full page reload
        window.dispatchEvent(new CustomEvent('documentsUpdated'));
      } else if (errorCount > 0) {
        toast({
          title: 'Download failed',
          description: lastError || 'Failed to download signed documents',
          variant: 'destructive'
        });
      }

    } catch (error: any) {
      console.error('Error downloading signed document:', error);
      toast({
        title: 'Download failed',
        description: error.message || 'Failed to download signed document',
        variant: 'destructive'
      });
    } finally {
      setDownloadingSignedDoc(false);
    }
  };

  // Modified save button handler that also updates persistent state
  const handleSaveSignedDocumentToDealRoom = async () => {
    
    await handleDownloadSignedDocument();
  };
  
  return (
    <li className="milestone-item">
      <span className={`milestone-indicator ${
        milestone.status === 'completed' ? 'milestone-indicator-completed' :
        milestone.status === 'in_progress' ? 'milestone-indicator-in-progress' :
        milestone.status === 'blocked' ? 'milestone-indicator-blocked' :
        'milestone-indicator-not-started'
      }`}>
        {milestone.order_index + 1}
      </span>
      <h4 className="flex flex-wrap items-center gap-3 mb-2 text-base sm:text-lg font-semibold text-foreground">
        <span className="break-words">{milestone.title}</span>
        <span className={`text-xs sm:text-sm font-medium px-2 py-0.5 rounded ${
          milestone.status === 'completed' ? 'bg-primary/10 text-primary' :
          milestone.status === 'in_progress' ? 'bg-accent/10 text-accent' :
          milestone.status === 'blocked' ? 'bg-destructive/10 text-destructive' :
          'bg-muted text-muted-foreground'
        }`}>
          {formatStatus(milestone.status, milestone.assignedUser?.name)}
        </span>
        
        {/* Assignment indicator */}
        {milestone.assignedUser && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <User className="h-3 w-3 mr-1" />
            {milestone.assignedUser.name}
          </span>
        )}

        {/* Signing Status Indicator for milestones with documents */}
        {milestoneDocuments.length > 0 && (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            milestoneSigningStatus === 'completed' 
              ? 'bg-primary/10 text-primary' 
              : milestoneSigningStatus === 'sent'
              ? 'bg-accent/10 text-accent'
              : 'bg-muted text-muted-foreground'
          }`}>
            {milestoneSigningStatus === 'completed' ? (
              <><CheckCircle className="h-3 w-3 mr-1" />Signed</>
            ) : milestoneSigningStatus === 'sent' ? (
              <><Clock className="h-3 w-3 mr-1" />Pending Signature</>
            ) : (
              <><FileCheck className="h-3 w-3 mr-1" />Ready to Sign</>
            )}
          </span>
        )}

        {/* Role-specific signing messages */}
        {milestoneDocuments.length > 0 && milestoneSigningStatus === 'sent' && !userHasSigned && hasOtherSignatures && (
          <div className="mt-2 text-sm bg-accent/10 text-accent px-3 py-2 rounded-md border border-accent/20">
            <div className="flex items-center">
              <FileCheck className="h-4 w-4 mr-2" />
              {signerNames.length > 0 
                ? `${signerNames.join(', ')} ${signerNames.length === 1 ? 'has' : 'have'} signed, please check your email and sign the document`
                : 'Someone has signed, please check your email and sign the document'
              }
            </div>
          </div>
        )}
        
        {/* Add the explain button */}
        {isParticipant && (
          <div className="ms-2">
            <MilestoneExplainButton 
              dealId={dealId}
              milestoneId={milestone.id}
              milestoneTitle={milestone.title}
              milestoneDescription={milestone.description}
              userRole={userRole}
            />
          </div>
        )}
      </h4>
      {(milestone.dueDate || milestone.completedAt || milestone.assignedUser) && (
        <div className="block mb-3 text-sm font-normal leading-relaxed">
          {milestone.status !== 'completed' ? (
            <>
              {milestone.dueDate && (
                <span className="text-muted-foreground">
                  Due by: {formatDate(milestone.dueDate)}
                </span>
              )}
              {/* Show completion badge when assigned user has completed the milestone */}
              {milestone.assignedUser && (milestone.status as string) === 'completed' && (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 border border-primary/20 text-primary mt-1">
                  <UserCheck className="h-4 w-4 mr-2" />
                  <span className="font-semibold">{milestone.assignedUser.name}</span>
                  <span className="ml-1">completed</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {milestone.completedAt && (
                <span className="text-muted-foreground text-sm">
                  {formatDate(milestone.completedAt)}
                </span>
              )}
            </div>
          )}
        </div>
      )}
      {milestone.description && (
        <p className="mt-1 mb-4 text-sm sm:text-base font-normal text-muted-foreground">{milestone.description}</p>
      )}

      {/* Sequential milestone warning */}
      {milestone.status === 'not_started' && !canStart && previousMilestone && (
        <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
          <p className="text-sm text-accent">
            <span className="font-medium">Waiting for previous milestone:</span> "{previousMilestone.title}" must be completed before this milestone can be started.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Assignment Button - Show for sellers/admins when milestone is not completed */}
        {canAssignMilestone && milestone.status !== 'completed' && (
          <button
            onClick={() => setIsAssignmentModalOpen(true)}
            className="btn-milestone-action btn-milestone-outline text-primary"
          >
            <UserCheck className="h-3 w-3 mr-1" />
            {milestone.assignedUser ? 'Reassign' : 'Assign'}
          </button>
        )}

        {/* Document Upload Button - Show for admins when milestone is not completed */}
        {canUploadMilestoneDocuments && milestone.status !== 'completed' && (
          <button
            onClick={() => setShowDocumentUpload(!showDocumentUpload)}
            className="btn-milestone-action btn-milestone-outline text-primary"
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload Document
          </button>
        )}

        {/* Status Update Buttons - Only show if user has permission */}
        {canUpdateMilestone && (
          <>
            {/* "Mark as Completed" button - only for in_progress milestones with restrictions */}
            {milestone.status === 'in_progress' && (
              <button
                onClick={() => {
                  if (isDocumentSigning && milestoneSigningStatus !== 'completed') {
                    alert('Documents must be signed by all parties before completing the Document Signing milestone.');
                    return;
                  }
                  
                  onUpdateStatus(milestone.id, 'completed');
                }}
                disabled={
                  updatingMilestoneId === milestone.id || 
                  (isDocumentSigning && milestoneSigningStatus !== 'completed')
                }
                className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  isDocumentSigning && milestoneSigningStatus !== 'completed'
                    ? 'text-muted-foreground bg-muted border border-border cursor-not-allowed' 
                    : 'bg-background border border-border hover:bg-muted text-foreground'
                } ${updatingMilestoneId === milestone.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={
                  isDocumentSigning && milestoneSigningStatus !== 'completed' 
                    ? 'Please sign the document before completing this milestone' 
                    : ''
                }
              >
                {updatingMilestoneId === milestone.id ? 'Updating...' : 'Mark as Completed'}
              </button>
            )}

            {/* "Approve Completion" button - only for pending_approval milestones by admins/sellers/lawyers */}
            {milestone.status === 'pending_approval' && ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase()) && (
              <button
                onClick={() => onUpdateStatus(milestone.id, 'completed')}
                disabled={updatingMilestoneId === milestone.id}
                className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
              >
                {updatingMilestoneId === milestone.id ? 'Approving...' : 'Approve Completion'}
              </button>
            )}
            
            {/* "Start Milestone" button - only for admins and not_started milestones if previous milestone is completed */}
            {milestone.status === 'not_started' && canStartMilestone && (
              <button
                onClick={() => onUpdateStatus(milestone.id, 'in_progress')}
                disabled={updatingMilestoneId === milestone.id || !canStart}
                className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  !canStart 
                    ? 'text-muted-foreground bg-muted border border-border cursor-not-allowed' 
                    : 'text-primary-foreground bg-primary hover:bg-primary/90'
                }`}
                title={!canStart ? `Previous milestone "${previousMilestone?.title}" must be completed first` : ''}
              >
                {updatingMilestoneId === milestone.id ? 'Updating...' : 'Start Milestone'}
              </button>
            )}
            
            {/* "Mark as Blocked" button - for in_progress and not_started milestones */}
            {['in_progress', 'not_started'].includes(milestone.status) && (
              <button
                onClick={() => onUpdateStatus(milestone.id, 'blocked')}
                disabled={updatingMilestoneId === milestone.id}
                className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90 transition-colors"
              >
                {updatingMilestoneId === milestone.id ? 'Updating...' : 'Mark as Blocked'}
              </button>
            )}
            
            {/* "Resume Milestone" button - only for blocked milestones */}
            {milestone.status === 'blocked' && (
              <button
                onClick={() => onUpdateStatus(milestone.id, 'in_progress')}
                disabled={updatingMilestoneId === milestone.id}
                className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                {updatingMilestoneId === milestone.id ? 'Updating...' : 'Resume Milestone'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Save Document Button - Show for admins when any milestone has fully signed documents */}
      {milestoneSigningStatus === 'completed' && userRole.toLowerCase() === 'admin' && milestoneDocuments.length > 0 && (
        <div className="mt-3">
          <button
            onClick={handleSaveSignedDocumentToDealRoom}
            className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
              downloadingSignedDoc || savedSignedDocuments.has(milestone.id)
                ? 'text-muted-foreground bg-muted border border-border cursor-not-allowed' 
                : 'text-primary-foreground bg-primary hover:bg-primary/90'
            }`}
            disabled={downloadingSignedDoc || savedSignedDocuments.has(milestone.id)}
          >
            <Save className="w-4 h-4 mr-2" />
            {downloadingSignedDoc 
              ? 'Saving...' 
              : savedSignedDocuments.has(milestone.id)
                ? 'Saved to Deal Room' 
                : 'Save Document'
            }
          </button>
        </div>
      )}

      {/* Document Signing Workflow - Show for Document Signing milestone when in progress */}
      {isDocumentSigning && milestone.status === 'in_progress' && (
        <div className="mt-3 flex flex-col gap-3">
          {/* Assigned users get different messages instead of sign button */}
          {milestone.assigned_to === user?.id ? (
            <div className="flex gap-2">
              {!hasOtherSignatures ? (
                <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
                  <FileText className="w-4 h-4 mr-2" />
                  You need to sign this document
                </div>
              ) : (
                <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <FileText className="w-4 h-4 mr-2" />
                  {signerNames.join(', ')} has signed. Check your email and sign the document
                </div>
              )}
            </div>
          ) : (
            /* Sign Document Button - Show for non-assigned users when not started */
            milestoneSigningStatus === 'not_started' && showSignButton && (
              <div className="flex gap-2">
                <button
                  onClick={handleSignDocument}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-emerald-300 animate-fade-in"
                  disabled={signingInProgress}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {signingInProgress ? 'Starting...' : 'Sign Document'}
                </button>
              </div>
            )
          )}

          {/* Signed State - Show signed button */}
          {milestoneSigningStatus === 'completed' && (
            <div className="flex items-center gap-3">
              <button
                disabled
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 border border-gray-200 cursor-not-allowed rounded-lg"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Signed
              </button>
              <div className="text-sm text-emerald-600 font-medium">
                ✓ Document signed by all parties
              </div>
            </div>
          )}

          {/* Partially Signed State */}
          {milestoneSigningStatus === 'sent' && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadSignedDocument}
                  disabled={true}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed rounded-lg"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Save Signed Document
                </button>
              </div>
              <div className="text-xs text-amber-600 font-medium">
                Waiting for Recipient's Sign
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document Upload Section - Show when upload button is clicked */}
      {showDocumentUpload && canUploadMilestoneDocuments && (
        <div className="mt-4">
          <DocumentUpload
            dealId={dealId}
            userRole={userRole}
            isParticipant={isParticipant}
            permissions={{
              canUpload: true,
              canAddVersions: true,
              userRole: userRole
            }}
            dealStatus="active"
            milestoneId={milestone.id}
            milestoneTitle={milestone.title}
            onUpload={() => {
              setShowDocumentUpload(false);
              fetchMilestoneDocuments();
              fetchMilestoneMessages();
              onMilestoneUpdated?.();
            }}
          />
        </div>
      )}

      {/* Milestone Messages - Only show if milestone is not completed */}
      {milestoneMessages.length > 0 && (milestone.status as string) !== 'completed' && (
        <div className="mt-4 space-y-2">
          {milestoneMessages.map((message, index) => (
            <div key={index} className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-sm text-primary">{message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Milestone Documents with Enhanced Status */}
      {milestoneDocuments.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium text-foreground mb-3">Documents for this milestone:</h5>
          
          {/* Document Signing Status Component */}
          <DocumentSigningStatus 
            documentCount={milestoneDocuments.length}
            signingStatus={milestoneSigningStatus}
            isAssignedUser={milestone.assigned_to === user?.id}
            userHasSigned={userHasSigned}
            hasOtherSignatures={hasOtherSignatures}
            signerNames={signerNames}
            milestone={{
              id: milestone.id,
              title: milestone.title,
              assigned_to: milestone.assigned_to
            }}
          />
          
          <div className="space-y-2 mt-4">
            {milestoneDocuments.map((doc) => (
              <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/50 rounded-lg p-3 gap-2">
                 <div className="min-w-0 flex-1">
                   <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                   <p className="text-xs text-muted-foreground">
                     Uploaded by {doc.profiles?.name || 'Unknown User'} on {new Date(doc.created_at).toLocaleDateString()}
                   </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Preview Button - Show for all participants */}
                    <Button
                      onClick={() => {
                        setPreviewDocument({
                          id: doc.id,
                          name: doc.name,
                          storage_path: doc.storage_path
                        });
                        setIsPreviewModalOpen(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    
                      {/* Save to Deal Room Button removed from here - it's already in the main status section */}
                     
                     {/* Show sign button only for admins/non-assigned users */}
                     {milestone.assigned_to !== user?.id && canSignMilestoneDocuments && (
                       <>
                         {milestoneSigningStatus === 'completed' ? (
                           <Button
                             disabled
                             size="sm"
                             variant="outline"
                             className="text-green-600 border-green-200 bg-green-50"
                           >
                             <CheckCircle className="h-4 w-4 mr-2" />
                             Signed
                           </Button>
                         ) : (
                           <Button
                             onClick={() => handleSignDocument()}
                             size="sm"
                             variant="outline"
                             className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                           >
                             <FileCheck className="h-4 w-4 mr-2" />
                             Sign Document
                           </Button>
                         )}
                       </>
                     )}
                  </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Signature Positioning Modal */}
      {selectedDocument && (
        <SignaturePositioningModal
          isOpen={isSignatureModalOpen}
          onClose={() => {
            setIsSignatureModalOpen(false);
            setSelectedDocument(null);
            setSigners([]);
          }}
          onConfirm={handleSignaturePositionsConfirmed}
          documentUrl={selectedDocument.url}
          documentFilename={selectedDocument.name}
          signers={signers}
          isLoading={signingInProgress}
        />
      )}

      {/* Document Preview Modal */}
      <MilestoneDocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewDocument(null);
        }}
        document={previewDocument}
        dealId={dealId}
      />

      {/* Assignment Modal */}
      <MilestoneAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        milestoneId={milestone.id}
        dealId={dealId}
        currentAssignedTo={milestone.assigned_to}
        onAssignmentUpdated={() => {
          onMilestoneUpdated?.();
        }}
      />
    </li>
  );
};

export default MilestoneItem;