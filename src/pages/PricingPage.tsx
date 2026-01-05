
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Zap, Shield, Building2, ArrowRight, Users, FileText, Brain, PenTool, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface PricingPlan {
  id: 'starter' | 'professional' | 'enterprise';
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  targetMarket: string;
  icon: React.ReactNode;
  popular?: boolean;
  features: PlanFeature[];
  limits: {
    participants: string;
    documents: string;
    aiQueries: string;
    docusignEnvelopes: string;
    dealDuration: string;
  };
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small business acquisitions and straightforward deals',
    price: 49,
    priceLabel: 'per deal',
    targetMarket: 'Deals under $500K',
    icon: <Zap className="h-6 w-6" />,
    features: [
      { text: 'Up to 4 participants', included: true },
      { text: 'Up to 20 documents', included: true },
      { text: '10 AI queries/month', included: true },
      { text: '5 DocuSign envelopes', included: true },
      { text: '60-day deal duration', included: true },
      { text: 'Basic health monitoring', included: true },
      { text: 'Email support', included: true },
      { text: 'Advanced predictions', included: false },
      { text: 'Custom thresholds', included: false },
      { text: 'Custom branding', included: false },
    ],
    limits: {
      participants: '4',
      documents: '20',
      aiQueries: '10',
      docusignEnvelopes: '5',
      dealDuration: '60 days',
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for mid-market transactions requiring deeper analysis',
    price: 149,
    priceLabel: 'per deal',
    targetMarket: 'Deals $500K - $10M',
    icon: <Shield className="h-6 w-6" />,
    popular: true,
    features: [
      { text: 'Up to 10 participants', included: true, highlight: true },
      { text: 'Up to 50 documents', included: true, highlight: true },
      { text: '50 AI queries/month', included: true, highlight: true },
      { text: '20 DocuSign envelopes', included: true, highlight: true },
      { text: '180-day deal duration', included: true },
      { text: 'Advanced health monitoring', included: true },
      { text: 'Deal health predictions', included: true, highlight: true },
      { text: 'Priority email support', included: true },
      { text: 'Custom thresholds', included: false },
      { text: 'Custom branding', included: false },
    ],
    limits: {
      participants: '10',
      documents: '50',
      aiQueries: '50',
      docusignEnvelopes: '20',
      dealDuration: '180 days',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Full-featured solution for large, complex transactions',
    price: 399,
    priceLabel: 'per deal',
    targetMarket: 'Deals $10M+',
    icon: <Building2 className="h-6 w-6" />,
    features: [
      { text: 'Unlimited participants', included: true, highlight: true },
      { text: 'Unlimited documents', included: true, highlight: true },
      { text: 'Unlimited AI queries', included: true, highlight: true },
      { text: 'Unlimited DocuSign envelopes', included: true, highlight: true },
      { text: '365-day deal duration', included: true },
      { text: 'Advanced health monitoring', included: true },
      { text: 'Deal health predictions', included: true },
      { text: 'Custom alert thresholds', included: true, highlight: true },
      { text: 'Dedicated account manager', included: true, highlight: true },
      { text: 'Custom branding', included: true, highlight: true },
    ],
    limits: {
      participants: 'Unlimited',
      documents: 'Unlimited',
      aiQueries: 'Unlimited',
      docusignEnvelopes: 'Unlimited',
      dealDuration: '365 days',
    },
  },
];

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelectPlan = (planId: string) => {
    if (user) {
      // Redirect to create deal with plan pre-selected
      navigate(`/create-deal?plan=${planId}`);
    } else {
      // Redirect to login, then back to create deal
      navigate(`/login?redirect=/create-deal?plan=${planId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            Trustroom.ai
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/login">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            Simple, transparent pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Pay per deal, not per seat
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Choose the plan that fits your deal size. No hidden fees, no long-term contracts.
            Every plan includes AI-powered analysis and DocuSign integration.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative flex flex-col ${
                  plan.popular 
                    ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                    : 'border-border'
                }`}
              >
                {plan.popular && (
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
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.priceLabel}</span>
                  </div>

                  {/* Quick limits overview */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{plan.limits.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{plan.limits.documents} docs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      <span>{plan.limits.aiQueries} AI queries</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <PenTool className="h-4 w-4 text-muted-foreground" />
                      <span>{plan.limits.docusignEnvelopes} signatures</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm col-span-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{plan.limits.dealDuration} duration</span>
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
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                What happens when my deal duration expires?
              </h3>
              <p className="text-muted-foreground">
                You'll have read-only access to your deal room. To continue making changes or 
                uploading documents, you can extend your deal by purchasing additional time.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Can I upgrade my plan mid-deal?
              </h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade at any time. You'll only pay the difference between your 
                current plan and the new one, prorated for the remaining deal duration.
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
                of your plan, so you can focus on closing your deal.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                What if I need more than the Enterprise plan offers?
              </h3>
              <p className="text-muted-foreground">
                For extremely large or complex transactions, contact us for custom pricing. 
                We can accommodate multiple concurrent deals, custom integrations, and dedicated support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Ready to close your next deal?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of businesses using Trustroom.ai to streamline their M&A transactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => handleSelectPlan('professional')}>
              Start with Professional
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Trustroom.ai. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
