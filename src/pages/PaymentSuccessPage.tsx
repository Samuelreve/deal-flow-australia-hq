import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import AppLayout from '@/components/layout/AppLayout';

const PaymentSuccessPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'starter';
  
  const planNames: Record<string, string> = {
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
  };

  const PageContent = (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 p-4 rounded-full bg-success/10">
            <CheckCircle className="h-12 w-12 text-success" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Payment Successful!</span>
          </div>
          <CardTitle className="text-2xl">
            Welcome to {planNames[planId] || 'Premium'}!
          </CardTitle>
          <CardDescription>
            Your payment has been processed successfully. You now have access to all the features included in your plan.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-4 text-left">
            <h4 className="font-medium mb-2">What's next?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                Create your first deal room
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                Invite participants to collaborate
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                Upload documents for AI analysis
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button asChild size="lg">
              <Link to="/create-deal">
                Create Your Deal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (user) {
    return <AuthenticatedLayout>{PageContent}</AuthenticatedLayout>;
  }

  return <AppLayout>{PageContent}</AppLayout>;
};

export default PaymentSuccessPage;
