
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({ steps, currentStep }) => {
  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {steps.length}
        </div>
        <div className="text-sm font-medium text-primary">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>
      
      <Progress value={progressPercentage} className="h-3 mb-6" />
      
      {/* Step indicators */}
      <div className="flex justify-between">
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          
          return (
            <div 
              key={step.id}
              className={`flex flex-col items-center text-center flex-1 ${
                isCompleted || isCurrent ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className={`mb-2 p-3 rounded-full border-2 ${
                isCompleted 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : isCurrent 
                  ? 'border-primary bg-background' 
                  : 'border-muted bg-background'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>
              <div className="space-y-1">
                <div className={`text-sm font-medium ${
                  isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
