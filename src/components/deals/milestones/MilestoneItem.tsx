import React, { useState, useEffect } from 'react';
import { Milestone } from '@/types/deal';
import { useMilestoneHelpers } from './useMilestoneHelpers';
import { useAuth } from '@/contexts/AuthContext';
import MilestoneExplainButton from './MilestoneExplainButton';
import DocumentSelectionModal from './DocumentSelectionModal';
import SignaturePositioningModal from './SignaturePositioningModal';
import MilestoneAssignmentModal from './MilestoneAssignmentModal';
import DocumentUpload from '../document/DocumentUpload';
import { FileText, UserCheck, User, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MilestoneItemProps {
  milestone: Milestone;
  userRole: string;
  updatingMilestoneId: string | null;
  onUpdateStatus: (milestoneId: string, newStatus: "not_started" | "in_progress" | "completed" | "blocked") => void;
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
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{id: string, url: string} | null>(null);
  const [signers, setSigners] = useState<Array<{email: string, name: string, recipientId: string}>>([]);
  const [documentsAreSigned, setDocumentsAreSigned] = useState(false);
  const [checkingSignatures, setCheckingSignatures] = useState(false);
  const [signingInProgress, setSigningInProgress] = useState(false);
  const [downloadingSignedDoc, setDownloadingSignedDoc] = useState(false);
  const [documentSaved, setDocumentSaved] = useState(false);
  const [signingStatus, setSigningStatus] = useState<'not_started' | 'partially_signed' | 'completed'>('not_started');
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  // Determine if the current user has permission to update milestone status
  // Admin can always update, assigned user can update, or seller can update unassigned milestones
  const canUpdateMilestone = isParticipant && (
    ['admin'].includes(userRole.toLowerCase()) || 
    (milestone.assigned_to === user?.id) ||
    (!milestone.assigned_to && ['seller'].includes(userRole.toLowerCase()))
  );
  
  // Permission to assign/unassign milestones (sellers and admins only)
  const canAssignMilestone = isParticipant && ['admin', 'seller'].includes(userRole.toLowerCase());
  
  // Permission to upload documents for milestones (admins only)
  const canUploadMilestoneDocuments = isParticipant && ['admin'].includes(userRole.toLowerCase());
  
  // Check if this is the "Document Signing" milestone
  const isDocumentSigning = milestone.title.toLowerCase().includes('document signing');
  
  // Only show sign button for "Document Signing" milestone when it's in progress
  const showSignButton = isDocumentSigning && 
    ['buyer', 'seller', 'lawyer', 'admin'].includes(userRole.toLowerCase()) &&
    milestone.status === 'in_progress';
  
  // Check if documents are signed for this deal
  useEffect(() => {
    if (isDocumentSigning) {
      checkDocumentSignatures();
    }
  }, [dealId, isDocumentSigning]);

  // Re-check signatures when window regains focus (user returns from DocuSign)
  useEffect(() => {
    const handleFocus = () => {
      if (isDocumentSigning) {
        // Add a small delay to ensure callback has processed
        setTimeout(() => {
          checkDocumentSignatures();
        }, 1000);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isDocumentSigning]);

  const checkDocumentSignatures = async () => {
    if (!dealId) return;
    
    setCheckingSignatures(true);
    try {
      // Check for all signatures for this deal (both completed and sent)
      const { data: allSignatures, error } = await supabase
        .from('document_signatures')
        .select('*')
        .eq('deal_id', dealId);

      if (error) {
        console.error('Error checking signatures:', error);
        return;
      }

      // Check completed signatures
      const completedSignatures = allSignatures?.filter(sig => sig.status === 'completed') || [];
      const buyerSigned = completedSignatures.some(sig => sig.signer_role === 'buyer');
      const sellerSigned = completedSignatures.some(sig => sig.signer_role === 'seller');
      const adminSigned = completedSignatures.some(sig => sig.signer_role === 'admin');
      
      // Check if any signatures are sent (waiting for signature)
      const sentSignatures = allSignatures?.filter(sig => sig.status === 'sent') || [];
      
      // Update signing status based on signatures
      // Admin can act as either buyer or seller, so if admin signed, consider it complete
      // Or if both buyer and seller signed, it's complete
      if ((buyerSigned && sellerSigned) || adminSigned) {
        setSigningStatus('completed');
        setDocumentsAreSigned(true);
      } else if (sentSignatures.length > 0) {
        setSigningStatus('partially_signed');
        setDocumentsAreSigned(false);
      } else if (completedSignatures.length > 0) {
        setSigningStatus('partially_signed');
        setDocumentsAreSigned(false);
      } else {
        setSigningStatus('not_started');
        setDocumentsAreSigned(false);
      }
      
    } catch (error) {
      console.error('Error checking document signatures:', error);
    } finally {
      setCheckingSignatures(false);
    }
  };
  
  // Prevent completing Document Signing if documents aren't signed
  const canMarkAsCompleted = milestone.status === 'in_progress' && 
    (!isDocumentSigning || signingStatus === 'completed');

  const handleSignDocument = () => {
    console.log('Sign document clicked for milestone:', milestone.id, milestone.title);
    setIsDocumentModalOpen(true);
  };

  const handleDocumentSelected = async (documentId: string, buyerId?: string) => {
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

      // Get signed URL for document preview
      let signedUrl: string;
      
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
          console.log(`Failed to get signed URL for path: ${path}`, error);
          continue;
        }
      }

      if (!urlData?.signedUrl) {
        throw new Error('Failed to generate document preview');
      }

      // Prepare signers list
      const currentUserProfile = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      const signersList = [
        {
          email: user.email!,
          name: currentUserProfile.data?.name || user.email!,
          recipientId: '1'
        }
      ];

      // Add buyer if selected
      if (buyerId) {
        const { data: buyerProfile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', buyerId)
          .single();
        
        if (buyerProfile) {
          signersList.push({
            email: buyerProfile.email,
            name: buyerProfile.name,
            recipientId: '2'
          });
        }
      }

      // Set up for signature positioning
      setSelectedDocument({ id: documentId, url: urlData.signedUrl });
      setSigners(signersList);
      setIsDocumentModalOpen(false);
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

  const handleSignaturePositionsConfirmed = async (positions: Array<{x: number, y: number, page: number, recipientId: string, recipientName: string}>) => {
    if (!selectedDocument || !user) return;

    setSigningInProgress(true);
    try {
      console.log('Starting DocuSign process with custom positions:', positions);

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
      
      // Call DocuSign edge function to initiate signing
      const { data, error } = await supabase.functions.invoke('docusign-sign', {
        body: {
          documentId: selectedDocument.id,
          dealId,
          signerEmail: user.email,
          signerName: signers[0]?.name || user.email,
          signerRole: userRole.toLowerCase(),
          buyerEmail: signers[1]?.email,
          buyerName: signers[1]?.name,
          signaturePositions: signersWithPositions
        }
      });

      if (error) {
        throw error;
      }

      if (data?.signingUrl) {
        console.log('Got signing URL from DocuSign:', data.signingUrl);
        
        // Open DocuSign signing URL in new window
        const newWindow = window.open(data.signingUrl, '_blank');
        
        if (newWindow) {
          console.log('New tab opened successfully');
        } else {
          console.warn('Failed to open new tab - may be blocked by popup blocker');
          window.location.href = data.signingUrl;
        }
        
        // Close the modals
        setIsSignatureModalOpen(false);
        setSelectedDocument(null);
        setSigners([]);
        
        toast({
          title: 'Document signing initiated',
          description: 'Please complete the signing process in the new window.'
        });

        // Refresh signature status after a delay
        setTimeout(() => {
          checkDocumentSignatures();
        }, 2000);
      } else {
        console.error('No signing URL received from DocuSign API');
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

  const handleDownloadSignedDocument = async () => {
    if (!user) return;

    setDownloadingSignedDoc(true);
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

        if (error) {
          console.error('Error downloading envelope:', signature.envelope_id, error);
          continue;
        }

        console.log('Successfully downloaded signed document:', data);
      }

      toast({
        title: 'Success',
        description: 'Signed document has been saved to Documents tab',
      });

      // Mark document as saved
      setDocumentSaved(true);

      // Trigger refresh of documents list without full page reload
      window.dispatchEvent(new CustomEvent('documentsUpdated'));

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
  
  return (
    <li className="mb-10 ms-6">
      <span className={`absolute flex items-center justify-center w-6 h-6 ${getStatusColor(milestone.status)} rounded-full -start-3 ring-8 ring-white dark:ring-gray-800`}>
        {/* Status indicator circle */}
      </span>
      <h4 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
        {milestone.title}
        <span className={`text-sm font-medium me-2 px-2.5 py-0.5 rounded ms-3 ${getStatusColor(milestone.status)}`}>
          {formatStatus(milestone.status)}
        </span>
        
        {/* Assignment indicator */}
        {milestone.assignedUser && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ms-2">
            <User className="h-3 w-3 mr-1" />
            {milestone.assignedUser.name}
          </span>
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
      {(milestone.dueDate || milestone.completedAt) && (
        <div className="block mb-2 text-sm font-normal leading-none">
          {milestone.status !== 'completed' 
            ? milestone.dueDate ? (
                <span className="text-gray-400 dark:text-gray-500">
                  Due by: {formatDate(milestone.dueDate)}
                </span>
              ) : null
            : (
              <div className="flex items-center gap-2 flex-wrap">
                {milestone.assignedUser && (
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700 dark:text-green-300">
                    <UserCheck className="h-4 w-4 mr-2" />
                    <span className="font-semibold">{milestone.assignedUser.name}</span>
                    <span className="ml-1">completed this milestone</span>
                  </div>
                )}
                {milestone.completedAt && (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {formatDate(milestone.completedAt)}
                  </span>
                )}
              </div>
            )
          }
        </div>
      )}
      {milestone.description && (
        <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{milestone.description}</p>
      )}

      {/* Sequential milestone warning */}
      {milestone.status === 'not_started' && !canStart && previousMilestone && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
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
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:ring-2 focus:outline-none focus:ring-blue-500"
          >
            <UserCheck className="h-3 w-3 mr-1" />
            {milestone.assignedUser ? 'Reassign' : 'Assign'}
          </button>
        )}

        {/* Document Upload Button - Show for admins when milestone is not completed */}
        {canUploadMilestoneDocuments && milestone.status !== 'completed' && (
          <button
            onClick={() => setShowDocumentUpload(!showDocumentUpload)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 focus:ring-2 focus:outline-none focus:ring-green-500"
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload Document
          </button>
        )}

        {/* Status Update Buttons - Only show if user has permission */}
        {canUpdateMilestone && (
          <>
            {/* "Mark as Completed" button - only for in_progress milestones with restrictions for Document Signing */}
            {milestone.status === 'in_progress' && (
              <button
                onClick={() => {
                  console.log('🖱️ Mark as completed clicked:', { 
                    milestoneId: milestone.id, 
                    milestoneTitle: milestone.title,
                    isDocumentSigning,
                    signingStatus,
                    canUpdateMilestone,
                    userRole,
                    assignedTo: milestone.assigned_to,
                    currentUserId: user?.id
                  });
                  
                  if (isDocumentSigning && signingStatus !== 'completed') {
                    console.log('❌ Blocking completion - documents not signed');
                    alert('Documents must be signed by all parties before completing the Document Signing milestone.');
                    return;
                  }
                  
                  console.log('✅ Proceeding with milestone completion');
                  onUpdateStatus(milestone.id, 'completed');
                }}
                disabled={updatingMilestoneId === milestone.id || (isDocumentSigning && signingStatus !== 'completed')}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                  isDocumentSigning && signingStatus !== 'completed' 
                    ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed' 
                    : 'text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700'
                } rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 ${updatingMilestoneId === milestone.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isDocumentSigning && signingStatus !== 'completed' ? 'Documents must be signed by all parties first' : ''}
              >
                {updatingMilestoneId === milestone.id ? 'Updating...' : 'Mark as Completed'}
              </button>
            )}
            
            {/* "Start Milestone" button - only for not_started milestones if previous milestone is completed */}
            {milestone.status === 'not_started' && (
              <button
                onClick={() => onUpdateStatus(milestone.id, 'in_progress')}
                disabled={updatingMilestoneId === milestone.id || !canStart}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                  !canStart 
                    ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed' 
                    : 'text-white bg-blue-600 hover:bg-blue-700'
                } rounded-lg focus:z-10 focus:ring-4 focus:outline-none ${
                  !canStart ? 'focus:ring-gray-100' : 'focus:ring-blue-300'
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
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-red-300"
              >
                {updatingMilestoneId === milestone.id ? 'Updating...' : 'Mark as Blocked'}
              </button>
            )}
            
            {/* "Resume Milestone" button - only for blocked milestones */}
            {milestone.status === 'blocked' && (
              <button
                onClick={() => onUpdateStatus(milestone.id, 'in_progress')}
                disabled={updatingMilestoneId === milestone.id}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-300"
              >
                {updatingMilestoneId === milestone.id ? 'Updating...' : 'Resume Milestone'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Document Signing Workflow - Show for Document Signing milestone when in progress */}
      {isDocumentSigning && milestone.status === 'in_progress' && (
        <div className="mt-3 flex flex-col gap-3">
          {/* Sign Document Button - Show when not started or can start signing */}
          {signingStatus === 'not_started' && (
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
          )}

          {/* Partially Signed State */}
          {signingStatus === 'partially_signed' && (
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

          {/* Fully Signed State - Show save button for admin */}
          {signingStatus === 'completed' && (
            <div className="flex items-center gap-3">
              <div className="text-sm text-emerald-600 font-medium">
                ✓ Document signed by all parties
              </div>
              {userRole === 'admin' && (
                <button
                  onClick={handleDownloadSignedDocument}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg focus:z-10 focus:ring-4 focus:outline-none ${
                    downloadingSignedDoc || documentSaved 
                      ? 'text-gray-500 bg-gray-100 border border-gray-200 cursor-not-allowed' 
                      : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300'
                  }`}
                  disabled={downloadingSignedDoc || documentSaved}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {downloadingSignedDoc ? 'Saving...' : documentSaved ? 'Document Saved' : 'Save Document to Deal'}
                </button>
              )}
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
              onMilestoneUpdated?.();
            }}
          />
        </div>
      )}

      {/* Document Selection Modal */}
      <DocumentSelectionModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        dealId={dealId}
        userRole={userRole}
        onDocumentSelected={handleDocumentSelected}
        isLoading={signingInProgress}
      />

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
          signers={signers}
          isLoading={signingInProgress}
        />
      )}

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