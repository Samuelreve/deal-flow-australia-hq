import React from 'react';
import Joyride, { TooltipRenderProps } from 'react-joyride';
import { useTour } from '@/contexts/TourContext';
import { useAuth } from '@/contexts/AuthContext';
import { tourSteps, getRoleSpecificSteps } from '@/config/tourSteps';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

// Custom tooltip component with glassmorphism styling
const CustomTooltip: React.FC<TooltipRenderProps> = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  size,
}) => {
  return (
    <div
      {...tooltipProps}
      className="max-w-md rounded-xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl p-0 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-5 py-4 border-b border-border/30">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {step.title}
          </h3>
          <button
            {...closeProps}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.content}
        </p>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-muted/30 border-t border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {index + 1} of {size}
          </span>
          <button
            {...skipProps}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-2"
          >
            Skip tour
          </button>
        </div>
        <div className="flex items-center gap-2">
          {index > 0 && (
            <Button
              {...backProps}
              variant="ghost"
              size="sm"
            >
              Back
            </Button>
          )}
          <Button
            {...primaryProps}
            size="sm"
            className="btn-premium"
          >
            {continuous ? (index === size - 1 ? 'Finish' : 'Next') : 'Close'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const OnboardingTour: React.FC = () => {
  const { tourState, handleTourCallback } = useTour();
  const { user } = useAuth();

  // Get role-specific steps if user has a role
  const steps = user?.role ? getRoleSpecificSteps(user.role) : tourSteps;

  if (!tourState.run) return null;

  return (
    <Joyride
      steps={steps}
      run={tourState.run}
      stepIndex={tourState.stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleTourCallback}
      tooltipComponent={CustomTooltip}
      disableScrolling={false}
      spotlightClicks
      styles={{
        options: {
          zIndex: 10000,
          arrowColor: 'hsl(var(--background))',
        },
        spotlight: {
          borderRadius: 12,
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
      floaterProps={{
        styles: {
          arrow: {
            length: 8,
            spread: 16,
          },
        },
      }}
    />
  );
};

export default OnboardingTour;
