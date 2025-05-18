
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Document } from "@/types/deal";
import { Select } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define document categories
const documentCategories = [
  'NDA',
  'Financial',
  'Legal', 
  'Operational',
  'Marketing',
  'Other'
];

interface DocumentUploadProps {
  onUpload: (file: File, category: string, documentId?: string) => Promise<void>;
  uploading: boolean;
  userRole?: string;
  isParticipant?: boolean;
  documents?: Document[];
  permissions?: {
    canUpload: boolean;
    canAddVersions: boolean;
    userRole: string | null;
  };
  dealStatus?: string | null;
}

const DocumentUpload = ({ 
  onUpload, 
  uploading, 
  userRole = 'user',
  isParticipant = true,
  documents = [],
  permissions,
  dealStatus
}: DocumentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [uploadType, setUploadType] = useState<'new' | 'version'>('new');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { user } = useAuth();

  // Check if user has permission to upload documents based on passed permissions or fallback to role check
  const canUploadDocuments = permissions?.canUpload ?? 
    (isParticipant && ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase()));
  
  // Check if deal status allows uploads
  const isDealStatusAllowingUploads = !dealStatus || ['draft', 'active', 'pending'].includes(dealStatus);

  // Don't render if user can't upload or deal status doesn't allow uploads
  if (!canUploadDocuments || !isDealStatusAllowingUploads) {
    // If it's a status restriction, show an explanation
    if (isParticipant && !isDealStatusAllowingUploads) {
      return (
        <Alert variant="warning" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Document uploads are not allowed when the deal is in {dealStatus} status.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
    setUploadError(null);
  };

  const handleUploadTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUploadType(event.target.value as 'new' | 'version');
    setUploadError(null);
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDocumentId(event.target.value);
    setUploadError(null);
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    
    if (uploadType === 'new' && !selectedCategory) {
      setUploadError('Please select a document category.');
      return;
    }
    
    if (uploadType === 'version' && !selectedDocumentId) {
      setUploadError('Please select a document to add a version to.');
      return;
    }
    
    try {
      // For new documents, pass category; for versions, pass existing document ID
      if (uploadType === 'new') {
        await onUpload(selectedFile, selectedCategory);
      } else {
        await onUpload(selectedFile, '', selectedDocumentId);
      }
      
      setSelectedFile(null);
      setSelectedCategory("");
      setSelectedDocumentId("");
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      setUploadError(error.message || 'File upload failed');
    }
  };

  // Only render upload functionality if the user has appropriate permissions
  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="text-lg font-semibold mb-3">Upload Document</h4>
      
      {/* Upload Type Selection */}
      <div className="mb-3">
        <label htmlFor="upload-type" className="block text-sm font-medium text-gray-700 mb-1">
          Upload Type
        </label>
        <select
          id="upload-type"
          value={uploadType}
          onChange={handleUploadTypeChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          disabled={uploading}
        >
          <option value="new">New Document</option>
          <option value="version" disabled={documents.length === 0}>New Version of Existing Document</option>
        </select>
      </div>
      
      {/* Document Selection (for new versions) */}
      {uploadType === 'version' && (
        <div className="mb-3">
          <label htmlFor="document-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Document
          </label>
          <select
            id="document-select"
            value={selectedDocumentId}
            onChange={handleDocumentChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            disabled={uploading}
          >
            <option value="">-- Select a Document --</option>
            {documents.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </select>
        </div>
      )}
      
      {/* Category Selection (for new documents) */}
      {uploadType === 'new' && (
        <div className="mb-3">
          <label htmlFor="document-category" className="block text-sm font-medium text-gray-700 mb-1">
            Document Category
          </label>
          <select
            id="document-category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            disabled={uploading}
          >
            <option value="">-- Select a Category --</option>
            {documentCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      )}
      
      {/* File Selection */}
      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 mb-3"
        disabled={uploading}
      />

      {selectedFile && (
        <p className="text-sm text-muted-foreground mb-3">
          Selected file: <span className="font-medium">{selectedFile.name}</span>
        </p>
      )}

      {uploadError && (
        <p className="text-sm text-red-600 mb-3">{uploadError}</p>
      )}

      <Button
        onClick={handleUploadClick}
        disabled={
          !selectedFile || 
          (uploadType === 'new' && !selectedCategory) || 
          (uploadType === 'version' && !selectedDocumentId) || 
          uploading
        }
        className="mt-2"
      >
        {uploading ? 'Uploading...' : uploadType === 'new' ? 'Upload Document' : 'Upload New Version'}
      </Button>
    </div>
  );
};

export default DocumentUpload;
