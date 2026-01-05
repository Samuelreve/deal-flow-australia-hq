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
    participants: number;
    documents: number;
    aiQueries: string;
    docusign: boolean;
    dealDuration: string;
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
      participants: 2,
      documents: 5,
      aiQueries: '3/month',
      docusign: false,
      dealDuration: '14 days',
    },
    features: [
      { name: 'Up to 2 participants', included: true },
      { name: 'Up to 5 documents', included: true },
      { name: '3 AI queries/month', included: true },
      { name: '14-day deal duration', included: true },
      { name: 'DocuSign integration', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    priceLabel: 'per deal',
    description: 'Perfect for simple transactions',
    icon: Zap,
    cta: 'Get Started',
    limits: {
      participants: 5,
      documents: 20,
      aiQueries: '50/month',
      docusign: true,
      dealDuration: '90 days',
    },
    features: [
      { name: 'Up to 5 participants', included: true },
      { name: 'Up to 20 documents', included: true },
      { name: '50 AI queries/month', included: true },
      { name: '90-day deal duration', included: true },
      { name: 'DocuSign integration', included: true },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 149,
    priceLabel: 'per deal',
    description: 'For complex deals with multiple parties',
    icon: Crown,
    cta: 'Choose Professional',
    popular: true,
    limits: {
      participants: 15,
      documents: 100,
      aiQueries: '200/month',
      docusign: true,
      dealDuration: '180 days',
    },
    features: [
      { name: 'Up to 15 participants', included: true },
      { name: 'Up to 100 documents', included: true },
      { name: '200 AI queries/month', included: true },
      { name: '180-day deal duration', included: true },
      { name: 'DocuSign integration', included: true },
      { name: 'Priority support', included: true },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    priceLabel: 'per deal',
    description: 'Unlimited power for large transactions',
    icon: Building2,
    cta: 'Contact Sales',
    limits: {
      participants: -1,
      documents: -1,
      aiQueries: 'Unlimited',
      docusign: true,
      dealDuration: 'Unlimited',
    },
    features: [
      { name: 'Unlimited participants', included: true },
      { name: 'Unlimited documents', included: true },
      { name: 'Unlimited AI queries', included: true },
      { name: 'Unlimited deal duration', included: true },
      { name: 'DocuSign integration', included: true },
      { name: 'Priority support', included: true },
    ],
  },
];

interface PricingSectionProps {
  className?: string;
  showTitle?: boolean;
  onSelectPlan?: (planId: string) => void;
}

export function PricingSection({ className, showTitle = true, onSelectPlan }: PricingSectionProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSelectPlan = (planId: string) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    } else if (isAuthenticated) {
      // Authenticated users go to dashboard
      navigate('/dashboard');
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
              No monthly subscriptions. Pay only for the deals you close. Start free and upgrade when you're ready.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingPlans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col transition-all duration-200 hover:shadow-lg",
                  plan.popular && "border-primary shadow-md ring-2 ring-primary/20",
                  plan.id === 'free' && "border-muted bg-muted/30"
                )}
              >
                {plan.popular && (
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
                      <span className="text-muted-foreground ml-1">/{plan.priceLabel}</span>
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
                    variant={plan.popular ? "default" : plan.id === 'free' ? "outline" : "secondary"}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {plan.cta}
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
