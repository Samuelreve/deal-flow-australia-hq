import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTour } from '@/contexts/TourContext';
import { Sparkles, ArrowRight, X } from 'lucide-react';

const WelcomeModal: React.FC = () => {
  const { tourState, startTour, dismissWelcome } = useTour();

  return (
    <Dialog open={tourState.showWelcome} onOpenChange={(open) => !open && dismissWelcome()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 p-8 text-center">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground">
                Welcome to Trustroom.ai! 🎉
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                Your secure platform for managing business deals
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Would you like a quick tour to learn how to get the most out of the platform?
          </p>

          <div className="grid gap-3">
            <Button
              onClick={startTour}
              className="w-full btn-premium"
              size="lg"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Take the Tour
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              onClick={dismissWelcome}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <X className="mr-2 h-4 w-4" />
              Skip for Now
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            You can restart the tour anytime from Settings
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
