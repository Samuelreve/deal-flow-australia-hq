
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { Document } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Upload, Loader } from 'lucide-react';
import { Alert } from '@/components/ui/alert';

interface DocumentUploadFormProps {
  onUpload: (file: File, category: string, documentId?: string) => Promise<void>;
  uploading: boolean;
  documents?: Document[];
}

const DocumentUploadForm = ({ 
  onUpload, 
  uploading, 
  documents = [] 
}: DocumentUploadFormProps) => {
  const {
    selectedFile,
    selectedCategory,
    uploadType,
    selectedDocumentId,
    uploadError,
    handleFileChange,
    handleCategoryChange,
    handleUploadTypeChange,
    handleDocumentChange,
    handleUploadClick,
    isUploadDisabled
  } = useDocumentUpload({ onUpload, uploading, documents });
  
  const documentCategories = [
    "Contract",
    "Agreement",
    "Financial Statement",
    "Legal Document",
    "Business Plan",
    "Due Diligence",
    "Other"
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <select 
            className="w-full border rounded p-2 text-sm"
            onChange={handleUploadTypeChange}
            value={uploadType}
          >
            <option value="new">Upload New Document</option>
            <option value="version" disabled={documents.length === 0}>
              Add Version to Existing Document
            </option>
          </select>
        </div>
        
        {uploadType === 'version' && (
          <div>
            <select 
              className="w-full border rounded p-2 text-sm"
              onChange={handleDocumentChange}
              value={selectedDocumentId}
              disabled={documents.length === 0}
            >
              <option value="">Select Document</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {uploadType === 'new' && (
          <div>
            <select 
              className="w-full border rounded p-2 text-sm"
              onChange={handleCategoryChange}
              value={selectedCategory}
            >
              <option value="">Select Category</option>
              {documentCategories.map((category) => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <input 
            type="file" 
            id="document-file" 
            className="w-full text-sm" 
            onChange={handleFileChange}
          />
          
          <Button
            onClick={handleUploadClick}
            disabled={isUploadDisabled}
            size="sm"
          >
            {uploading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
        
        {uploadError && (
          <Alert variant="destructive">
            <p className="text-xs">{uploadError}</p>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadForm;
