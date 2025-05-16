
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Document } from "@/types/deal";
import { FileText } from "lucide-react";

// Define props for the DocumentManagement component
interface DocumentManagementProps {
  dealId: string; // The ID of the current deal
  userRole?: string; // The role of the current user
  initialDocuments?: Document[]; // Initial documents to display
}

const DocumentManagement = ({ 
  dealId, 
  userRole = "admin", 
  initialDocuments = [] 
}: DocumentManagementProps) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle file selection from input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null); // Clear previous errors
    } else {
      setSelectedFile(null);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create a new document object with the uploaded file
    const newDocument: Document = {
      id: `doc-${Date.now()}`, // Simple unique ID
      name: selectedFile.name,
      url: "#", // Placeholder URL
      uploadedBy: userRole,
      uploadedAt: new Date(),
      size: selectedFile.size,
      type: selectedFile.type,
      status: "draft",
      version: 1
    };

    // Add the new document to the list
    setDocuments(prevDocuments => [...prevDocuments, newDocument]);
    
    // Show success message
    toast({
      title: "File uploaded successfully!",
      description: `${selectedFile.name} has been uploaded.`,
    });
    
    // Reset form state
    setSelectedFile(null);
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      {/* Document List */}
      {documents.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No documents yet</h3>
          <p className="text-muted-foreground mb-4">Upload documents to share with deal participants</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>
                      {new Intl.DateTimeFormat("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      }).format(doc.uploadedAt)}
                    </span>
                    <span className="mx-1">•</span>
                    <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                    {doc.status === "signed" && (
                      <>
                        <span className="mx-1">•</span>
                        <span className="text-green-600">Signed</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          ))}
        </div>
      )}

      {/* Document Upload Section */}
      <div className="border-t pt-4 mt-4">
        <h4 className="text-lg font-semibold mb-3">Upload New Document</h4>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 mb-3"
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
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="mt-2"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
    </div>
  );
};

export default DocumentManagement;
