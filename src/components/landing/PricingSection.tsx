import { Check, X, Gift, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PricingPlan {
  id: 'free' | 'starter' | 'professional' | 'enterprise';
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: { name: string; included: boolean }[];
  limits: {
    activeDeals: number;
    participants: number;
    documents: number;
    aiQueries: string;
    docusign: boolean;
  };
  popular?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  cta: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: 'forever',
    description: 'Try it out with basic features',
    icon: Gift,
    cta: 'Try Free',
    limits: {
      activeDeals: 1,
      participants: 2,
      documents: 5,
      aiQueries: '10/month',
      docusign: false,
    },
    features: [
      { name: '1 active deal', included: true },
      { name: 'Up to 2 participants', included: true },
      { name: '10 AI queries/month', included: true },
      { name: 'Basic health monitoring', included: true },
      { name: 'DocuSign integration', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 39,
    priceLabel: '/month',
    description: 'Perfect for small teams',
    icon: Zap,
    cta: 'Subscribe',
    limits: {
      activeDeals: 3,
      participants: 5,
      documents: 25,
      aiQueries: '100/month',
      docusign: true,
    },
    features: [
      { name: '3 active deals', included: true },
      { name: 'Up to 5 participants per deal', included: true },
      { name: '100 AI queries/month', included: true },
      { name: '10 DocuSign envelopes/month', included: true },
      { name: 'Email support', included: true },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    priceLabel: '/month',
    description: 'For growing teams with multiple deals',
    icon: Crown,
    cta: 'Subscribe',
    popular: true,
    limits: {
      activeDeals: 10,
      participants: 15,
      documents: 100,
      aiQueries: '500/month',
      docusign: true,
    },
    features: [
      { name: '10 active deals', included: true },
      { name: 'Up to 15 participants per deal', included: true },
      { name: '500 AI queries/month', included: true },
      { name: '50 DocuSign envelopes/month', included: true },
      { name: 'Deal health predictions', included: true },
      { name: 'Priority support', included: true },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    priceLabel: '/month',
    description: 'Unlimited power for large teams',
    icon: Building2,
    cta: 'Subscribe',
    limits: {
      activeDeals: -1,
      participants: -1,
      documents: -1,
      aiQueries: 'Unlimited',
      docusign: true,
    },
    features: [
      { name: 'Unlimited active deals', included: true },
      { name: 'Unlimited participants', included: true },
      { name: 'Unlimited AI queries', included: true },
      { name: 'Unlimited DocuSign envelopes', included: true },
      { name: 'Custom branding', included: true },
      { name: 'Dedicated account manager', included: true },
    ],
  },
];

interface PricingSectionProps {
  className?: string;
  showTitle?: boolean;
  onSelectPlan?: (planId: string) => void;
  currentPlan?: string | null;
}

export function PricingSection({ className, showTitle = true, onSelectPlan, currentPlan }: PricingSectionProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSelectPlan = (planId: string) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    } else if (isAuthenticated) {
      // Authenticated users go to pricing page
      navigate('/pricing');
    } else {
      // Unauthenticated users go to auth page
      navigate(`/auth?mode=signup&plan=${planId}`);
    }
  };

  return (
    <section className={cn("py-16 px-4", className)} id="pricing">
      <div className="max-w-7xl mx-auto">
        {showTitle && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple monthly plans. Cancel anytime. Start free and upgrade when you're ready.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingPlans.map((plan) => {
            const IconComponent = plan.icon;
            const isCurrentPlan = currentPlan === plan.id;
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col transition-all duration-200 hover:shadow-lg",
                  isCurrentPlan && "border-emerald-500 ring-2 ring-emerald-500/20",
                  !isCurrentPlan && plan.popular && "border-primary shadow-md ring-2 ring-primary/20",
                  !isCurrentPlan && plan.id === 'free' && "border-muted bg-muted/30"
                )}
              >
                {isCurrentPlan && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white">
                    Your Plan
                  </Badge>
                )}
                {!isCurrentPlan && plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center",
                    plan.popular ? "bg-primary/10" : "bg-muted"
                  )}>
                    <IconComponent className={cn(
                      "h-6 w-6",
                      plan.popular ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm min-h-[40px]">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground ml-1">{plan.priceLabel}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                        )}
                        <span className={cn(
                          feature.included ? "text-foreground" : "text-muted-foreground/50"
                        )}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : plan.popular ? "default" : plan.id === 'free' ? "outline" : "secondary"}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Current Plan' : plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include secure document storage, real-time collaboration, and milestone tracking.
        </p>
      </div>
    </section>
  );
}
