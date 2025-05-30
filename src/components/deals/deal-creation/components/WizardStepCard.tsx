
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface WizardStepCardProps {
  step: Step;
  children: React.ReactNode;
}

export const WizardStepCard: React.FC<WizardStepCardProps> = ({ step, children }) => (
  <Card className="shadow-lg">
    <CardHeader className="pb-4">
      <div className="flex items-center space-x-3">
        <step.icon className="h-6 w-6 text-primary" />
        <div>
          <CardTitle className="text-2xl">{step.title}</CardTitle>
          <p className="text-muted-foreground mt-1">{step.description}</p>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      {children}
    </CardContent>
  </Card>
);
