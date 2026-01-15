import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Zap, Shield, Building2, ArrowRight, Users, FileText, Brain, PenTool, Clock, Gift, Loader2, CheckCircle2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface PricingPlan {
  id: 'free' | 'starter' | 'professional' | 'enterprise';
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  targetMarket: string;
  icon: React.ReactNode;
  popular?: boolean;
  features: PlanFeature[];
  limits: {
    activeDeals: string;
    participants: string;
    documents: string;
    aiQueries: string;
    docusignEnvelopes: string;
  };
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Try Trustroom with a simple deal - no credit card required',
    price: 0,
    priceLabel: 'forever',
    targetMarket: 'Try it out',
    icon: <Gift className="h-6 w-6" />,
    features: [
      { text: '1 active deal', included: true },
      { text: 'Up to 2 participants', included: true },
      { text: 'Up to 5 documents', included: true },
      { text: '10 AI queries/month', included: true },
      { text: 'No DocuSign signatures', included: false },
      { text: 'Basic health monitoring', included: true },
      { text: 'Community support', included: true },
      { text: 'Advanced predictions', included: false },
      { text: 'Custom thresholds', included: false },
      { text: 'Custom branding', included: false },
    ],
    limits: {
      activeDeals: '1',
      participants: '2',
      documents: '5',
      aiQueries: '10',
      docusignEnvelopes: '0',
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small business acquisitions and straightforward deals',
    price: 39,
    priceLabel: '/month',
    targetMarket: 'Small Teams',
    icon: <Zap className="h-6 w-6" />,
    features: [
      { text: '3 active deals', included: true },
      { text: 'Up to 5 participants per deal', included: true },
      { text: 'Up to 25 documents per deal', included: true },
      { text: '100 AI queries/month', included: true },
      { text: '10 DocuSign envelopes/month', included: true },
      { text: 'Basic health monitoring', included: true },
      { text: 'Email support', included: true },
      { text: 'Advanced predictions', included: false },
      { text: 'Custom thresholds', included: false },
      { text: 'Custom branding', included: false },
    ],
    limits: {
      activeDeals: '3',
      participants: '5',
      documents: '25',
      aiQueries: '100',
      docusignEnvelopes: '10',
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for mid-market transactions requiring deeper analysis',
    price: 99,
    priceLabel: '/month',
    targetMarket: 'Growing Teams',
    icon: <Shield className="h-6 w-6" />,
    popular: true,
    features: [
      { text: '10 active deals', included: true, highlight: true },
      { text: 'Up to 15 participants per deal', included: true, highlight: true },
      { text: 'Up to 100 documents per deal', included: true, highlight: true },
      { text: '500 AI queries/month', included: true, highlight: true },
      { text: '50 DocuSign envelopes/month', included: true, highlight: true },
      { text: 'Advanced health monitoring', included: true },
      { text: 'Deal health predictions', included: true, highlight: true },
      { text: 'Priority email support', included: true },
      { text: 'Custom thresholds', included: false },
      { text: 'Custom branding', included: false },
    ],
    limits: {
      activeDeals: '10',
      participants: '15',
      documents: '100',
      aiQueries: '500',
      docusignEnvelopes: '50',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Full-featured solution for large, complex transactions',
    price: 299,
    priceLabel: '/month',
    targetMarket: 'Large Teams',
    icon: <Building2 className="h-6 w-6" />,
    features: [
      { text: 'Unlimited active deals', included: true, highlight: true },
      { text: 'Unlimited participants', included: true, highlight: true },
      { text: 'Unlimited documents', included: true, highlight: true },
      { text: 'Unlimited AI queries', included: true, highlight: true },
      { text: 'Unlimited DocuSign envelopes', included: true, highlight: true },
      { text: 'Advanced health monitoring', included: true },
      { text: 'Deal health predictions', included: true },
      { text: 'Custom alert thresholds', included: true, highlight: true },
      { text: 'Dedicated account manager', included: true, highlight: true },
      { text: 'Custom branding', included: true, highlight: true },
    ],
    limits: {
      activeDeals: 'Unlimited',
      participants: 'Unlimited',
      documents: 'Unlimited',
      aiQueries: 'Unlimited',
      docusignEnvelopes: 'Unlimited',
    },
  },
];

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loadingCurrentPlan, setLoadingCurrentPlan] = useState(false);

  // Fetch current plan on mount - first from DB (cached), then sync with Stripe
  useEffect(() => {
    const fetchCurrentPlan = async () => {
      if (!user) {
        setCurrentPlan(null);
        setSubscriptionEnd(null);
        return;
      }

      setLoadingCurrentPlan(true);
      
      try {
        // Step 1: Immediately fetch cached plan from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_plan, subscription_end, subscription_status')
          .eq('id', user.id)
          .single();
        
        if (!profileError && profileData) {
          // Show cached data immediately
          setCurrentPlan(profileData.subscription_plan || 'free');
          setSubscriptionEnd(profileData.subscription_end || null);
          console.log('Loaded cached plan from DB:', profileData.subscription_plan);
        }
        
        setLoadingCurrentPlan(false);
        
        // Step 2: Sync with Stripe in background
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error('Error syncing subscription with Stripe:', error);
          return;
        }
        
        // Update if Stripe data differs from cached
        if (data?.currentPlan && data.currentPlan !== currentPlan) {
          setCurrentPlan(data.currentPlan);
          console.log('Updated plan from Stripe sync:', data.currentPlan);
        }
        if (data?.subscriptionEnd) {
          setSubscriptionEnd(data.subscriptionEnd);
        }
      } catch (error) {
        console.error('Error fetching current plan:', error);
        setLoadingCurrentPlan(false);
      }
    };

    fetchCurrentPlan();
  }, [user]);

  const handleSelectPlan = async (planId: string) => {
    // Free plan - just go to create deal
    if (planId === 'free') {
      if (user) {
        navigate(`/create-deal?plan=${planId}`);
      } else {
        navigate(`/login?redirect=/create-deal?plan=${planId}`);
      }
      return;
    }

    // Paid plans - require authentication
    if (!user) {
      navigate(`/login?redirect=/pricing`);
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to a plan.",
      });
      return;
    }

    // Start Stripe checkout
    setLoadingPlan(planId);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }

      // Handle case where user already has active subscription
      if (data?.hasActiveSubscription) {
        toast({
          title: "You already have an active subscription",
          description: "Opening the Customer Portal to manage your subscription...",
        });
        // Redirect to customer portal instead
        handleManageSubscription();
        return;
      }

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "Failed to start checkout. Please try again.",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw new Error(error.message || 'Failed to open customer portal');
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        variant: "destructive",
        title: "Portal failed",
        description: error instanceof Error ? error.message : "Failed to open portal. Please try again.",
      });
    } finally {
      setLoadingPortal(false);
    }
  };

  const PageContent = (
    <>
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            Simple, transparent pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple monthly plans for every team size
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Choose the plan that fits your needs. Cancel anytime, no hidden fees.
            Every plan includes AI-powered analysis and DocuSign integration.
          </p>
          {currentPlan && currentPlan !== 'free' && (
            <Button 
              variant="outline" 
              onClick={handleManageSubscription}
              disabled={loadingPortal}
            >
              {loadingPortal ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription
                </>
              )}
            </Button>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {pricingPlans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            
            return (
            <Card 
              key={plan.id}
              className={`relative flex flex-col ${
                isCurrentPlan
                  ? 'border-green-500 shadow-lg ring-2 ring-green-500/20'
                  : plan.popular 
                    ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                    : 'border-border'
              }`}
            >
              {isCurrentPlan ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-green-500 text-white flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Your Plan
                  </Badge>
                </div>
              ) : plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto mb-4 p-3 rounded-full ${
                  plan.popular 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[48px]">
                  {plan.description}
                </CardDescription>
                <Badge variant="outline" className="w-fit mx-auto mt-2">
                  {plan.targetMarket}
                </Badge>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  <span className="text-muted-foreground ml-1">{plan.priceLabel}</span>
                </div>

                {/* Quick limits overview */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{plan.limits.activeDeals} deals</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{plan.limits.participants} users</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                    <span>{plan.limits.aiQueries} AI</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <PenTool className="h-4 w-4 text-muted-foreground" />
                    <span>{plan.limits.docusignEnvelopes} sigs</span>
                  </div>
                </div>

                <Separator className="mb-6" />

                {/* Features list */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li 
                      key={index}
                      className={`flex items-start gap-3 text-sm ${
                        feature.included 
                          ? 'text-foreground' 
                          : 'text-muted-foreground line-through'
                      }`}
                    >
                      <Check 
                        className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          feature.included 
                            ? feature.highlight 
                              ? 'text-primary' 
                              : 'text-success' 
                            : 'text-muted-foreground/40'
                        }`} 
                      />
                      <span className={feature.highlight ? 'font-medium' : ''}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-4">
                <Button 
                  className="w-full" 
                  variant={isCurrentPlan ? 'secondary' : plan.popular ? 'default' : plan.id === 'free' ? 'secondary' : 'outline'}
                  size="lg"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loadingPlan === plan.id || isCurrentPlan}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      {plan.id === 'free' ? 'Try Free' : 'Subscribe'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-muted/50 rounded-lg">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                How does the monthly subscription work?
              </h3>
              <p className="text-muted-foreground">
                Your subscription renews automatically each month. You'll have access to all features 
                included in your plan for as long as your subscription is active. Cancel anytime.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-muted-foreground">
                Yes! You can change your plan at any time from the subscription management portal. 
                Changes take effect immediately, and you'll be prorated for the difference.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                What happens if I cancel my subscription?
              </h3>
              <p className="text-muted-foreground">
                Your subscription will remain active until the end of the current billing period. 
                After that, you'll be moved to the Free plan with limited features.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                What's included in AI queries?
              </h3>
              <p className="text-muted-foreground">
                AI queries include contract analysis, deal health predictions, document summaries, 
                and the AI copilot assistant. Each question or analysis request counts as one query.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Are DocuSign signatures really included?
              </h3>
              <p className="text-muted-foreground">
                Yes! Each envelope includes up to 10 signers. We handle all DocuSign fees as part 
                of your plan, so you can focus on closing your deals.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                What if I need more than the Enterprise plan offers?
              </h3>
              <p className="text-muted-foreground">
                For extremely large organizations or custom requirements, contact us for custom pricing. 
                We can accommodate additional integrations, SSO, and dedicated support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to close your next deal?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of businesses using Trustroom.ai to streamline their M&A transactions.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link to={user ? "/dashboard" : "/login"}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );

  // Render with appropriate layout
  if (user) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto max-w-7xl">
          {PageContent}
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-7xl">
        {PageContent}
      </div>
    </AppLayout>
  );
};

export default PricingPage;
