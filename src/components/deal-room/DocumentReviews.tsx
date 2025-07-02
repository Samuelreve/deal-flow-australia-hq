
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileText, CheckCircle, XCircle, Clock, MessageSquare, Loader2 } from 'lucide-react';

interface DocumentReview {
  id: string;
  document_id: string;
  reviewer_user_id: string;
  status: string;
  comments: string;
  created_at: string;
  updated_at: string;
  document: {
    name: string;
    type: string;
    size: number;
    uploaded_at: string;
  };
  reviewer: {
    name: string;
  };
}

interface DocumentReviewsProps {
  dealId: string;
  userRole: string | null;
}

const DocumentReviews: React.FC<DocumentReviewsProps> = ({ dealId, userRole }) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<DocumentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingDoc, setReviewingDoc] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    status: 'approved',
    comments: ''
  });

  useEffect(() => {
    fetchDocumentReviews();
  }, [dealId]);

  const fetchDocumentReviews = async () => {
    try {
      // Fetch documents that need review
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select(`
          id,
          name,
          type,
          size,
          created_at,
          document_reviews (
            id,
            reviewer_user_id,
            status,
            comments,
            created_at,
            updated_at,
            profiles!document_reviews_reviewer_user_id_fkey(name)
          )
        `)
        .eq('deal_id', dealId);

      if (documentsError) {
        throw documentsError;
      }

      // Transform the data
      const reviewsData: DocumentReview[] = [];
      documentsData?.forEach(doc => {
        doc.document_reviews?.forEach((review: any) => {
          reviewsData.push({
            id: review.id,
            document_id: doc.id,
            reviewer_user_id: review.reviewer_user_id,
            status: review.status,
            comments: review.comments,
            created_at: review.created_at,
            updated_at: review.updated_at,
            document: {
              name: doc.name,
              type: doc.type,
              size: doc.size,
              uploaded_at: doc.created_at
            },
            reviewer: {
              name: review.profiles?.name || 'Unknown'
            }
          });
        });
      });

      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching document reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load document reviews",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('document_reviews')
        .insert({
          document_id: documentId,
          deal_id: dealId,
          status: reviewForm.status,
          comments: reviewForm.comments || null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Review Submitted",
        description: "Your document review has been recorded",
      });

      setReviewingDoc(null);
      setReviewForm({ status: 'approved', comments: '' });
      fetchDocumentReviews();
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
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <span className="ml-2">Loading document reviews...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Document Reviews ({reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Document Reviews</h3>
              <p className="text-gray-600">No document reviews have been submitted for this deal yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">{review.document.name}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm text-gray-600">
                            {formatFileSize(review.document.size)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(review.document.uploaded_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(review.status)}
                      <Badge className={getStatusColor(review.status)}>
                        {review.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Reviewed by {review.reviewer.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(review.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {review.comments && (
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-700">{review.comments}</p>
                      </div>
                    )}
                  </div>
                  
                  {reviewingDoc === review.document_id && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium mb-3">Add Your Review</h5>
                      
                      <div className="space-y-4">
                        <div className="flex space-x-4">
                          <Button
                            variant={reviewForm.status === 'approved' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setReviewForm({ ...reviewForm, status: 'approved' })}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant={reviewForm.status === 'rejected' ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => setReviewForm({ ...reviewForm, status: 'rejected' })}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                        
                        <Textarea
                          placeholder="Add comments (optional)"
                          value={reviewForm.comments}
                          onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
                          rows={3}
                        />
                        
                        <div className="flex space-x-3">
                          <Button onClick={() => handleReviewSubmit(review.document_id)}>
                            Submit Review
                          </Button>
                          <Button variant="outline" onClick={() => setReviewingDoc(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {reviewingDoc !== review.document_id && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReviewingDoc(review.document_id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Review
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
