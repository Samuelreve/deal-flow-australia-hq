import React from 'react';
import { CheckCircle, Clock, FileCheck, Mail, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentSigningStatusProps {
  documentCount: number;
  signingStatus: 'not_started' | 'sent' | 'partially_completed' | 'completed';
  isAssignedUser: boolean;
  userHasSigned: boolean;
  hasOtherSignatures: boolean;
  signerNames: string[];
  milestone: {
    id: string;
    title: string;
    assigned_to: string | null;
  };
}

const DocumentSigningStatus: React.FC<DocumentSigningStatusProps> = ({
  documentCount,
  signingStatus,
  isAssignedUser,
  userHasSigned,
  hasOtherSignatures,
  signerNames,
  milestone
}) => {
  if (documentCount === 0) {
    return null;
  }

  // Status badge component
  const StatusBadge = () => {
    switch (signingStatus) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            🎉 Fully Signed
          </Badge>
        );
      case 'partially_completed':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Partially Signed
          </Badge>
        );
      case 'sent':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Mail className="h-3 w-3 mr-1" />
            Pending Signatures
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            <FileCheck className="h-3 w-3 mr-1" />
            Ready to Sign
          </Badge>
        );
    }
  };

  // Message for assigned users
  const getAssignedUserMessage = () => {
    if (signingStatus === 'completed') {
      return {
        type: 'success' as const,
        icon: CheckCircle,
        title: '🎉 All Signatures Complete!',
        message: 'This milestone document has been fully signed by all parties. The document is now legally complete and ready for the next phase.'
      };
    }

    if (signingStatus === 'partially_completed') {
      if (userHasSigned) {
        return {
          type: 'info' as const,
          icon: Clock,
          title: 'Waiting for Other Signatures',
          message: 'You have signed the document. Waiting for other parties to complete their signatures.'
        };
      } else {
        return {
          type: 'warning' as const,
          icon: Mail,
          title: 'Your Signature Required',
          message: `${signerNames.join(', ')} ${signerNames.length === 1 ? 'has' : 'have'} signed. Please check your email and sign the document.`
        };
      }
    }

    if (signingStatus === 'sent') {
      if (hasOtherSignatures) {
        return {
          type: 'warning' as const,
          icon: Mail,
          title: 'Your Signature Required',
          message: `${signerNames.join(', ')} ${signerNames.length === 1 ? 'has' : 'have'} signed. Please check your email and sign the document.`
        };
      } else {
        return {
          type: 'info' as const,
          icon: Mail,
          title: 'Document Sent for Signing',
          message: 'A signing request has been sent to your email. Please check your inbox and sign the document.'
        };
      }
    }

    return {
      type: 'default' as const,
      icon: FileCheck,
      title: 'Ready for Signing',
      message: 'Document is uploaded and ready to be sent for signatures.'
    };
  };

  const assignedMessage = isAssignedUser ? getAssignedUserMessage() : null;

  return (
    <div className="space-y-3">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Document Status:</span>
        <StatusBadge />
      </div>

      {/* Assigned User Alert */}
      {isAssignedUser && assignedMessage && (
        <Alert 
          variant={assignedMessage.type === 'warning' ? 'destructive' : 'default'}
          className={
            assignedMessage.type === 'success' 
              ? 'border-green-200 bg-green-50' 
              : assignedMessage.type === 'warning'
              ? 'border-orange-200 bg-orange-50'
              : assignedMessage.type === 'info'
              ? 'border-blue-200 bg-blue-50'
              : 'border-gray-200 bg-gray-50'
          }
        >
          <assignedMessage.icon className={`h-4 w-4 ${
            assignedMessage.type === 'success' 
              ? 'text-green-600' 
              : assignedMessage.type === 'warning'
              ? 'text-orange-600'
              : assignedMessage.type === 'info'
              ? 'text-blue-600'
              : 'text-gray-600'
          }`} />
          <AlertDescription>
            <div className="space-y-1">
              <div className={`font-medium ${
                assignedMessage.type === 'success' 
                  ? 'text-green-800' 
                  : assignedMessage.type === 'warning'
                  ? 'text-orange-800'
                  : assignedMessage.type === 'info'
                  ? 'text-blue-800'
                  : 'text-gray-800'
              }`}>
                {assignedMessage.title}
              </div>
              <div className={`text-sm ${
                assignedMessage.type === 'success' 
                  ? 'text-green-700' 
                  : assignedMessage.type === 'warning'
                  ? 'text-orange-700'
                  : assignedMessage.type === 'info'
                  ? 'text-blue-700'
                  : 'text-gray-700'
              }`}>
                {assignedMessage.message}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* General Status Information */}
      {signerNames.length > 0 && (
        <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
          <div className="font-medium">Signed by:</div>
          <div>{signerNames.join(', ')}</div>
        </div>
      )}
    </div>
  );
};

export default DocumentSigningStatus;