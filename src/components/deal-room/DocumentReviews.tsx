import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileText, CheckCircle, XCircle, Clock, MessageSquare, Loader2, Upload } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  created_at: string;
  status: string;
}

interface DocumentReviewsProps {
  dealId: string;
  userRole: string | null;
}

const DocumentReviews: React.FC<DocumentReviewsProps> = ({ dealId, userRole }) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingDoc, setReviewingDoc] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [dealId]);

  // Real-time subscription for document updates
  useEffect(() => {
    if (!dealId) return;

    const channel = supabase
      .channel('document-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `deal_id=eq.${dealId}`
        },
        (payload) => {
          console.log('Document updated:', payload.new);
          // Refresh documents when any document in this deal changes
          fetchDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId]);

  const fetchDocuments = async () => {
    try {
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('id, name, type, size, created_at, status')
        .eq('deal_id', dealId);

      if (documentsError) {
        throw documentsError;
      }

      setDocuments(documentsData || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (documentId: string, status: 'approved' | 'rejected') => {
    try {
      // Check if document is already signed to prevent double-approval
      const currentDoc = documents.find(doc => doc.id === documentId);
      if (currentDoc?.status === 'signed') {
        toast({
          title: "Already Approved",
          description: "This document has already been approved",
          variant: "destructive"
        });
        return;
      }
      // Add a comment about the review
      if (reviewComment.trim()) {
        const { error: commentError } = await supabase
          .from('comments')
          .insert({
            deal_id: dealId,
            document_id: documentId,
            content: `Document ${status}: ${reviewComment}`,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });

        if (commentError) {
          throw commentError;
        }
      }

      // Map review status to document status
      // approved -> signed, rejected -> draft
      const documentStatus = status === 'approved' ? 'signed' : 'draft';

      // Update document status
      const { error: updateError } = await supabase
        .from('documents')
        .update({ status: documentStatus })
        .eq('id', documentId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Review Submitted",
        description: `Document has been ${status}`,
      });

      setReviewingDoc(null);
      setReviewComment('');
      fetchDocuments();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'signed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'draft':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'final':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Upload className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-red-100 text-red-800';
      case 'final':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'signed':
        return 'Approved';
      case 'draft':
        return 'Needs Review';
      case 'final':
        return 'Under Review';
      default:
        return status;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Document Reviews ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents</h3>
              <p className="text-gray-600">No documents have been uploaded for this deal yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">{document.name}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm text-gray-600">
                            {formatFileSize(document.size)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(document.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(document.status)}
                      <Badge className={getStatusColor(document.status)}>
                        {getStatusLabel(document.status)}
                      </Badge>
                    </div>
                  </div>
                  
                  {reviewingDoc === document.id && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium mb-3">Review Document</h5>
                      
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Add review comments (optional)"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          rows={3}
                        />
                        
                        <div className="flex space-x-3">
                          <Button 
                            onClick={() => handleReviewSubmit(document.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            onClick={() => handleReviewSubmit(document.id, 'rejected')}
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button variant="outline" onClick={() => setReviewingDoc(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {reviewingDoc !== document.id && document.status !== 'signed' && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReviewingDoc(document.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Review Document
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentReviews;
