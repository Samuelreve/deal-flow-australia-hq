
import React, { useState, useEffect } from 'react';
import { Milestone } from '@/types/deal';
import { useMilestoneHelpers } from './useMilestoneHelpers';
import { useAuth } from '@/contexts/AuthContext';
import MilestoneExplainButton from './MilestoneExplainButton';
import DocumentSelectionModal from './DocumentSelectionModal';
import { FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MilestoneItemProps {
  milestone: Milestone;
  userRole: string;
  updatingMilestoneId: string | null;
  onUpdateStatus: (milestoneId: string, newStatus: "not_started" | "in_progress" | "completed" | "blocked") => void;
  isParticipant?: boolean;
  dealId: string;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({ 
  milestone, 
  userRole, 
  updatingMilestoneId, 
  onUpdateStatus,
  isParticipant = true,
  dealId
}) => {
  const { getStatusColor, formatStatus, formatDate } = useMilestoneHelpers();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [documentsAreSigned, setDocumentsAreSigned] = useState(false);
  const [checkingSignatures, setCheckingSignatures] = useState(false);

  // Determine if the current user has permission to update milestone status
  const canUpdateMilestone = isParticipant && ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase());
  
  // Debug logging to understand what we're working with
  console.log('Milestone data:', {
    id: milestone.id,
    title: milestone.title,
    status: milestone.status,
    documents: milestone.documents,
    userRole: userRole,
    isParticipant: isParticipant
  });
  
  // Check if this is the "Closing Preparations" milestone
  const isClosingPreparations = milestone.title.toLowerCase().includes('closing preparation');
  
  // Only show sign button for "Closing Preparations" milestone
  const showSignButton = isClosingPreparations && 
    ['buyer', 'seller', 'lawyer', 'admin'].includes(userRole.toLowerCase()) &&
    milestone.status === 'in_progress';
  
  // Check if documents are signed for this deal
  useEffect(() => {
    if (isClosingPreparations) {
      checkDocumentSignatures();
    }
  }, [dealId, isClosingPreparations]);

  const checkDocumentSignatures = async () => {
    if (!dealId) return;
    
    setCheckingSignatures(true);
    try {
      // Check if there are any completed signatures for this deal
      const { data: signatures, error } = await supabase
        .from('document_signatures')
        .select('*')
        .eq('deal_id', dealId)
        .eq('status', 'completed');

      if (error) {
        console.error('Error checking signatures:', error);
        return;
      }

      // Check if we have signatures from both buyer and seller
      const buyerSigned = signatures?.some(sig => sig.signer_role === 'buyer');
      const sellerSigned = signatures?.some(sig => sig.signer_role === 'seller');
      
      setDocumentsAreSigned(buyerSigned && sellerSigned);
    } catch (error) {
      console.error('Error checking document signatures:', error);
    } finally {
      setCheckingSignatures(false);
    }
  };
  
  // Prevent completing Closing Preparations if documents aren't signed
  const canMarkAsCompleted = milestone.status === 'in_progress' && 
    (!isClosingPreparations || documentsAreSigned);

  const handleSignDocument = () => {
    console.log('Sign document clicked for milestone:', milestone.id, milestone.title);
    setIsDocumentModalOpen(true);
  };

  const handleDocumentSelected = async (documentId: string, buyerId?: string) => {
    if (!user) return;

    try {
      console.log('Starting DocuSign process for document:', documentId, 'with buyer:', buyerId);
      
      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      let buyerInfo = null;
      if (buyerId) {
        // Get buyer profile information
        const { data: buyerProfile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', buyerId)
          .single();
        
        buyerInfo = buyerProfile;
      }
      
      // Call DocuSign edge function to initiate signing
      const { data, error } = await supabase.functions.invoke('docusign-sign', {
        body: {
          documentId,
          dealId,
          signerEmail: user.email,
          signerName: profile?.name || user.email,
          signerRole: userRole.toLowerCase(),
          buyerEmail: buyerInfo?.email,
          buyerName: buyerInfo?.name
        }
      });

      if (error) {
        throw error;
      }

      if (data?.signingUrl) {
        // Open DocuSign signing URL in new window
        window.open(data.signingUrl, '_blank');
        
        // Close the modal after successfully opening the signing URL
        setIsDocumentModalOpen(false);
        
        toast({
          title: 'Document signing initiated',
          description: 'Please complete the signing process in the new window.'
        });

        // Refresh signature status after a delay
        setTimeout(() => {
          checkDocumentSignatures();
        }, 2000);
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
        
        // Open consent URL in new tab
        window.open(consentUrl, '_blank');
        return;
      }
      
      toast({
        title: 'Signing failed',
        description: error.message || 'Failed to start document signing process',
        variant: 'destructive'
      });
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
        <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
          {milestone.status !== 'completed' 
            ? milestone.dueDate ? `Due by: ${formatDate(milestone.dueDate)}` : '' 
            : `Completed on: ${formatDate(milestone.completedAt)}`}
        </time>
      )}
      {milestone.description && (
        <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{milestone.description}</p>
      )}

      {/* Action Buttons - Only show if user has permission */}
      {canUpdateMilestone && (
        <div className="flex flex-wrap gap-2">
          {/* "Mark as Completed" button - only for in_progress milestones with restrictions for Closing Preparations */}
          {milestone.status === 'in_progress' && (
            <button
              onClick={() => {
                if (isClosingPreparations && !documentsAreSigned) {
                  alert('Documents must be signed before completing the Closing Preparations milestone.');
                  return;
                }
                onUpdateStatus(milestone.id, 'completed');
              }}
              disabled={updatingMilestoneId === milestone.id || (isClosingPreparations && !documentsAreSigned)}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                isClosingPreparations && !documentsAreSigned 
                  ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed' 
                  : 'text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700'
              } rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 ${updatingMilestoneId === milestone.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isClosingPreparations && !documentsAreSigned ? 'Documents must be signed first' : ''}
            >
              {updatingMilestoneId === milestone.id ? 'Updating...' : 'Mark as Completed'}
            </button>
          )}
          
          {/* "Start Milestone" button - only for not_started milestones */}
          {milestone.status === 'not_started' && (
            <button
              onClick={() => onUpdateStatus(milestone.id, 'in_progress')}
              disabled={updatingMilestoneId === milestone.id}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-300"
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
        </div>
      )}

      {/* Sign Document Button - Show separately for better visibility */}
      {showSignButton && (
        <div className="mt-3">
          <button
            onClick={handleSignDocument}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-emerald-300 animate-fade-in"
          >
            <FileText className="w-4 h-4 mr-2" />
            Sign Document
          </button>
        </div>
      )}

      {/* Document Selection Modal */}
      <DocumentSelectionModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        dealId={dealId}
        userRole={userRole}
        onDocumentSelected={handleDocumentSelected}
      />
    </li>
  );
};

export default MilestoneItem;
