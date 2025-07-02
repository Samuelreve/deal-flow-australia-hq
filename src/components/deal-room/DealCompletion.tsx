
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, AlertTriangle, Clock, Loader2 } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  status: string;
}

interface DealCompletionProps {
  dealId: string;
  deal: Deal;
  userRole: string | null;
}

const DealCompletion: React.FC<DealCompletionProps> = ({ dealId, deal, userRole }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [completing, setCompleting] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  const canComplete = userRole === 'admin' || userRole === 'seller';
  const isCompleted = deal.status === 'completed';

  const handleCompleteDeal = async () => {
    if (!canComplete) return;

    setCompleting(true);

    try {
      const { data, error } = await supabase.rpc('update_deal_status', {
        p_deal_id: dealId,
        p_new_status: 'completed'
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        // Add completion notes if provided
        if (completionNotes.trim()) {
          await supabase
            .from('comments')
            .insert({
              deal_id: dealId,
              content: `Deal completed. Notes: ${completionNotes}`,
              user_id: (await supabase.auth.getUser()).data.user?.id
            });
        }

        toast({
          title: "Deal Completed",
          description: "The deal has been successfully completed!",
        });

        // Redirect to deals list or refresh
        setTimeout(() => {
          navigate('/deals');
        }, 2000);
      } else {
        throw new Error(data?.message || 'Failed to complete deal');
      }
    } catch (error: any) {
      console.error('Error completing deal:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete deal",
        variant: "destructive"
      });
    } finally {
      setCompleting(false);
    }
  };

  const getCompletionChecklist = () => {
    // This would typically check various conditions
    return [
      {
        id: 'documents',
        label: 'All documents reviewed',
        completed: true, // This would be calculated based on document reviews
        icon: CheckCircle
      },
      {
        id: 'participants',
        label: 'All participants confirmed',
        completed: true, // This would be calculated based on participant status
        icon: CheckCircle
      },
      {
        id: 'payments',
        label: 'Payment arrangements confirmed',
        completed: false, // This would be calculated based on payment status
        icon: Clock
      }
    ];
  };

  const checklist = getCompletionChecklist();
  const allChecklistCompleted = checklist.every(item => item.completed);

  return (
    <div className="space-y-6">
      {/* Deal Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 mr-2 text-yellow-500" />
              )}
              Deal Status
            </CardTitle>
            
            <Badge className={isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isCompleted ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Deal Completed!</h3>
              <p className="text-gray-600">
                This deal has been successfully completed. All participants have been notified.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Review the completion checklist below and complete the deal when ready.
              </p>
              
              {!canComplete && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Access Restricted</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        Only deal administrators and sellers can complete deals.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Checklist */}
      {!isCompleted && (
        <Card>
          <CardHeader>
            <CardTitle>Completion Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checklist.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${item.completed ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={`${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                      {item.label}
                    </span>
                    {item.completed && (
                      <Badge variant="outline" className="text-green-700 border-green-200">
                        Complete
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            {!allChecklistCompleted && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Pending Items</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      Please complete all checklist items before finalizing the deal.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Completion Form */}
      {!isCompleted && canComplete && allChecklistCompleted && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Deal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="completion-notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Notes (Optional)
                </label>
                <Textarea
                  id="completion-notes"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Add any final notes about the deal completion..."
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleCompleteDeal}
                  disabled={completing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {completing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Completing Deal...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Deal
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-gray-600">
                  This action cannot be undone. All participants will be notified.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DealCompletion;
