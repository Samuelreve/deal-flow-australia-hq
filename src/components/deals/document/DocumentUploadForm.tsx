
import { Document } from "@/types/deal";
import { Button } from "@/components/ui/button";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";

// Define document categories
const documentCategories = [
  'NDA',
  'Financial',
  'Legal', 
  'Operational',
  'Marketing',
  'Other'
];

interface DocumentUploadFormProps {
  onUpload: (file: File, category: string, documentId?: string) => Promise<void>;
  uploading: boolean;
  documents: Document[];
}

const DocumentUploadForm = ({ onUpload, uploading, documents }: DocumentUploadFormProps) => {
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

  return (
    <>
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
        disabled={isUploadDisabled}
        className="mt-2"
      >
        {uploading ? 'Uploading...' : uploadType === 'new' ? 'Upload Document' : 'Upload New Version'}
      </Button>
    </>
  );
};

export default DocumentUploadForm;
