
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
    <CardHeader className="px-4 sm:px-6 pb-3 sm:pb-4">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <step.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <CardTitle className="text-lg sm:text-2xl">{step.title}</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{step.description}</p>
        </div>
      </div>
    </CardHeader>
    <CardContent className="px-4 sm:px-6 pt-0">
      {children}
    </CardContent>
  </Card>
);
