
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

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
  onUpload: (file: File, category: string) => Promise<void>;
  uploading: boolean;
  userRole?: string;
  isParticipant?: boolean;
}

const DocumentUpload = ({ 
  onUpload, 
  uploading, 
  userRole = 'user',
  isParticipant = true 
}: DocumentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { user } = useAuth();

  // Check if user has permission to upload documents
  const canUploadDocuments = isParticipant && ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase());

  if (!canUploadDocuments) {
    return null; // Don't render the upload section for users who can't upload
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

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    
    if (!selectedCategory) {
      setUploadError('Please select a document category.');
      return;
    }
    
    try {
      await onUpload(selectedFile, selectedCategory);
      setSelectedFile(null);
      setSelectedCategory("");
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      setUploadError(error.message || 'File upload failed');
    }
  };

  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="text-lg font-semibold mb-3">Upload New Document</h4>
      
      {/* Category Selection */}
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
        disabled={!selectedFile || !selectedCategory || uploading}
        className="mt-2"
      >
        {uploading ? 'Uploading...' : 'Upload Document'}
      </Button>
    </div>
  );
};

export default DocumentUpload;
