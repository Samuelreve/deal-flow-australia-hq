
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Upload } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { DocumentMetadata } from '@/types/contract';

interface DocumentDetailsProps {
  metadata: DocumentMetadata;
  documentMetadata?: DocumentMetadata; // backward compatibility
  isAnalyzing: boolean;
  onFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ 
  metadata, 
  documentMetadata, 
  isAnalyzing, 
  onFileUpload 
}) => {
  // Use either metadata or documentMetadata prop for backward compatibility
  const docData = metadata || documentMetadata;
  
  if (!docData) return null;
  
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
          <p className="text-sm text-muted-foreground">{docData.name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Type</h3>
          <p className="text-sm text-muted-foreground">{docData.type}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Uploaded</h3>
          <p className="text-sm text-muted-foreground">{docData.uploadDate}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Status</h3>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
              {docData.status}
            </Badge>
          </div>
        </div>
        
        {/* Add upload button if onFileUpload is provided */}
        {onFileUpload && (
          <div className="pt-4">
            <input 
              type="file" 
              id="document-upload" 
              className="hidden" 
              accept=".pdf,.docx,.doc" 
              onChange={onFileUpload} 
              disabled={isAnalyzing}
            />
            <label 
              htmlFor="document-upload"
              className="flex items-center justify-center w-full p-2 border-2 border-dashed rounded-md border-gray-300 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center py-2">
                <Upload className={`h-5 w-5 ${isAnalyzing ? 'text-gray-300' : 'text-blue-500'} mb-1`} />
                <p className={`text-sm ${isAnalyzing ? 'text-gray-400' : 'text-blue-600'}`}>
                  {isAnalyzing ? 'Processing...' : 'Upload new document'}
                </p>
              </div>
            </label>
            <p className="text-xs text-center mt-2 text-muted-foreground">
              Upload any document to see how our AI analyzes its content
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentDetails;
