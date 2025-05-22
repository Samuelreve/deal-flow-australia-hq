
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Upload } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

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
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
              {documentMetadata.status}
            </Badge>
          </div>
        </div>
        
        {/* Improved upload section */}
        <div className="pt-4">
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
            className={`flex items-center justify-center w-full p-2 border-2 border-dashed rounded-md cursor-pointer transition-colors ${isAnalyzing 
              ? 'border-gray-300 bg-gray-50' 
              : 'border-blue-300 bg-blue-50 hover:bg-blue-100'}`}
          >
            <div className="flex flex-col items-center justify-center py-3">
              <Upload className={`h-5 w-5 ${isAnalyzing ? 'text-gray-300' : 'text-blue-500'} mb-2`} />
              <p className={`text-sm font-medium ${isAnalyzing ? 'text-gray-400' : 'text-blue-600'}`}>
                {isAnalyzing ? 'Processing...' : 'Upload new document'}
              </p>
              <p className="text-xs text-center mt-1 text-muted-foreground">
                Supports PDF, DOCX, and TXT files
              </p>
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentDetails;
