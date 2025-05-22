
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Upload } from 'lucide-react';

interface DocumentMetadata {
  name: string;
  type: string;
  uploadDate: string;
  status: string;
  version: string;
  versionDate: string;
}

interface DocumentDetailsProps {
  documentMetadata: DocumentMetadata;
  isAnalyzing: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ 
  documentMetadata, 
  isAnalyzing, 
  onFileUpload 
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Name</h3>
          <p className="text-sm text-muted-foreground">{documentMetadata.name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Type</h3>
          <p className="text-sm text-muted-foreground">{documentMetadata.type}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Uploaded</h3>
          <p className="text-sm text-muted-foreground">{documentMetadata.uploadDate}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Status</h3>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-sm">{documentMetadata.status}</span>
          </div>
        </div>
        
        {/* Add upload button */}
        <div className="pt-2">
          <input 
            type="file" 
            id="document-upload" 
            className="hidden" 
            accept=".pdf,.docx,.doc,.txt" 
            onChange={onFileUpload} 
            disabled={isAnalyzing}
          />
          <label 
            htmlFor="document-upload"
            className="flex items-center justify-center w-full p-2 border-2 border-dashed rounded-md border-gray-300 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center py-2">
              <Upload className="h-5 w-5 text-gray-400 mb-1" />
              <p className="text-xs text-gray-600">Upload new document</p>
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentDetails;
