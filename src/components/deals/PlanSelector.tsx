
import React from 'react';
import { Check, Zap, Shield, Building2, Users, FileText, Brain, PenTool, Clock, Gift } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise';

interface PlanOption {
  id: PlanType;
  name: string;
  description: string;
  price: number;
  targetMarket: string;
  icon: React.ReactNode;
  popular?: boolean;
  limits: {
    participants: string;
    documents: string;
    aiQueries: string;
    docusignEnvelopes: string;
    dealDuration: string;
  };
}

const planOptions: PlanOption[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Try it out with a simple deal',
    price: 0,
    targetMarket: 'Trial',
    icon: <Gift className="h-5 w-5" />,
    limits: {
      participants: '2',
      documents: '5',
      aiQueries: '3/mo',
      docusignEnvelopes: '0',
      dealDuration: '14 days',
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small deals under $500K',
    price: 49,
    targetMarket: 'Small Business',
    icon: <Zap className="h-5 w-5" />,
    limits: {
      participants: '4',
      documents: '20',
      aiQueries: '10/mo',
      docusignEnvelopes: '5',
      dealDuration: '60 days',
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For mid-market deals $500K-$10M',
    price: 149,
    targetMarket: 'Mid-Market',
    icon: <Shield className="h-5 w-5" />,
    popular: true,
    limits: {
      participants: '10',
      documents: '50',
      aiQueries: '50/mo',
      docusignEnvelopes: '20',
      dealDuration: '180 days',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large deals $10M+',
    price: 399,
    targetMarket: 'Enterprise',
    icon: <Building2 className="h-5 w-5" />,
    limits: {
      participants: 'Unlimited',
      documents: 'Unlimited',
      aiQueries: 'Unlimited',
      docusignEnvelopes: 'Unlimited',
      dealDuration: '365 days',
    },
  },
];

interface PlanSelectorProps {
  selectedPlan: PlanType | null;
  onPlanSelect: (plan: PlanType) => void;
  className?: string;
  compact?: boolean;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  selectedPlan,
  onPlanSelect,
  className,
  compact = false,
}) => {
  if (compact) {
    return (
      <RadioGroup
        value={selectedPlan || ''}
        onValueChange={(value) => onPlanSelect(value as PlanType)}
        className={cn('space-y-3', className)}
      >
        {planOptions.map((plan) => (
          <div key={plan.id} className="relative">
            <RadioGroupItem
              value={plan.id}
              id={plan.id}
              className="peer sr-only"
            />
            <Label
              htmlFor={plan.id}
              className={cn(
                'flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all',
                'hover:border-primary/50 hover:bg-muted/50',
                'peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary/20',
                plan.popular && 'border-primary/30'
              )}
            >
              <div className={cn(
                'p-2 rounded-full',
                selectedPlan === plan.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {plan.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{plan.name}</span>
                  {plan.popular && (
                    <Badge variant="secondary" className="text-xs">Popular</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
                {plan.price > 0 && <span className="text-muted-foreground text-sm">/deal</span>}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {planOptions.map((plan) => (
        <Card
          key={plan.id}
          className={cn(
            'relative cursor-pointer transition-all hover:shadow-md',
            selectedPlan === plan.id 
              ? 'border-primary ring-2 ring-primary/20' 
              : 'border-border hover:border-primary/50',
            plan.popular && !selectedPlan && 'border-primary/30'
          )}
          onClick={() => onPlanSelect(plan.id)}
        >
          {plan.popular && (
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground text-xs">
                Recommended
              </Badge>
            </div>
          )}

          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className={cn(
                'p-2 rounded-full',
                selectedPlan === plan.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {plan.icon}
              </div>
              {selectedPlan === plan.id && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <CardTitle className="text-lg">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="mb-4">
              <span className="text-3xl font-bold">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
              {plan.price > 0 && <span className="text-muted-foreground">/deal</span>}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{plan.limits.participants} participants</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{plan.limits.documents} documents</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-muted-foreground" />
                <span>{plan.limits.aiQueries} AI queries</span>
              </div>
              <div className="flex items-center gap-2">
                <PenTool className="h-4 w-4 text-muted-foreground" />
                <span>{plan.limits.docusignEnvelopes} signatures</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{plan.limits.dealDuration} duration</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const getPlanLimits = (planType: PlanType) => {
  const plan = planOptions.find(p => p.id === planType);
  if (!plan) return null;
  
  return {
    ...plan.limits,
    price: plan.price,
    name: plan.name,
  };
};

export default PlanSelector;
