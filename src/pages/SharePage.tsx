import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, FileText, Download, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import DocumentViewer from '@/components/documents/DocumentViewer';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface SharedDocumentData {
  document_name: string;
  version_number: number;
  description: string | null;
  type: string;
  uploaded_at: string;
  can_download: boolean;
  signedUrl: string;
  expires_in_seconds: number;
}

const SharePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentData, setDocumentData] = useState<SharedDocumentData | null>(null);
  
  useEffect(() => {
    const fetchSharedDocument = async () => {
      if (!token) {
        setError('No share token provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const { data: response, error: functionError } = await supabase.functions.invoke('get-shared-document', {
          body: { token }
        });
        
        if (functionError || !response?.success) {
          throw new Error(functionError?.message || response?.error || 'Failed to fetch shared document');
        }
        
        setDocumentData(response.data);
      } catch (err: any) {
        console.error('Error fetching shared document:', err);
        setError(err.message || 'Failed to load the shared document');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSharedDocument();
  }, [token]);
  
  const handleDownload = () => {
    if (documentData?.signedUrl) {
      window.open(documentData.signedUrl, '_blank');
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading shared document...</p>
      </div>
    );
  }
  
  if (error || !documentData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-center">Document Unavailable</CardTitle>
              <CardDescription className="text-center">
                {error || "This shared document link is invalid or has expired."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button variant="secondary" onClick={() => window.close()}>Close</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-5xl">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  {documentData.document_name}
                </CardTitle>
                <CardDescription>
                  Version {documentData.version_number} • Uploaded {format(new Date(documentData.uploaded_at), 'PPP')}
                </CardDescription>
                {documentData.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{documentData.description}</p>
                )}
              </div>
              
              {documentData.can_download && (
                <Button onClick={handleDownload} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[70vh]">
              <DocumentViewer 
                documentUrl={documentData.signedUrl} 
                dealId=""  // Using an empty string as this is an external sharing context
                documentId=""
                versionId=""
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 text-xs text-muted-foreground flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                Shared via DealPilot
              </span>
            </div>
            {!documentData.can_download && (
              <div>Download disabled by document owner</div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SharePage;
