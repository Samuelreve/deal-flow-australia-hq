
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
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="text-xs sm:text-sm text-muted-foreground">
          Step {currentStep} of {steps.length}
        </div>
        <div className="text-xs sm:text-sm font-medium text-primary">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>
      
      <Progress value={progressPercentage} className="h-2 sm:h-3 mb-4 sm:mb-6" />
      
      {/* Step indicators - horizontal scroll on mobile */}
      <div className="flex justify-between overflow-x-auto pb-2 gap-1 sm:gap-0">
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          
          return (
            <div 
              key={step.id}
              className={`flex flex-col items-center text-center flex-1 min-w-[56px] sm:min-w-0 ${
                isCompleted || isCurrent ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className={`mb-1 sm:mb-2 p-2 sm:p-3 rounded-full border-2 ${
                isCompleted 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : isCurrent 
                  ? 'border-primary bg-background' 
                  : 'border-muted bg-background'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <div className={`text-[10px] sm:text-sm font-medium leading-tight ${
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
