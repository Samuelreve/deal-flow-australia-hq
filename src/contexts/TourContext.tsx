import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CallBackProps, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TourState {
  run: boolean;
  stepIndex: number;
  showWelcome: boolean;
}

interface TourContextType {
  tourState: TourState;
  startTour: () => void;
  stopTour: () => void;
  resetTour: () => void;
  skipTour: () => void;
  handleTourCallback: (data: CallBackProps) => void;
  isTourCompleted: boolean;
  dismissWelcome: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

interface TourProviderProps {
  children: React.ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isTourCompleted, setIsTourCompleted] = useState(true);
  const [tourState, setTourState] = useState<TourState>({
    run: false,
    stepIndex: 0,
    showWelcome: false,
  });

  // Check if tour is completed for this user
  useEffect(() => {
    const checkTourStatus = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('tour_completed')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking tour status:', error);
          return;
        }

        const completed = data?.tour_completed ?? false;
        setIsTourCompleted(completed);
        
        // Show welcome modal if tour not completed
        if (!completed) {
          setTourState(prev => ({ ...prev, showWelcome: true }));
        }
      } catch (err) {
        console.error('Error checking tour status:', err);
      }
    };

    checkTourStatus();
  }, [user?.id]);

  const markTourCompleted = useCallback(async () => {
    if (!user?.id) return;

    try {
      await supabase
        .from('profiles')
        .update({ tour_completed: true })
        .eq('id', user.id);
      
      setIsTourCompleted(true);
    } catch (err) {
      console.error('Error marking tour as completed:', err);
    }
  }, [user?.id]);

  const startTour = useCallback(() => {
    setTourState({
      run: true,
      stepIndex: 0,
      showWelcome: false,
    });
  }, []);

  const stopTour = useCallback(() => {
    setTourState(prev => ({ ...prev, run: false }));
  }, []);

  const resetTour = useCallback(async () => {
    if (!user?.id) return;

    try {
      await supabase
        .from('profiles')
        .update({ tour_completed: false })
        .eq('id', user.id);
      
      setIsTourCompleted(false);
      setTourState({
        run: true,
        stepIndex: 0,
        showWelcome: false,
      });
    } catch (err) {
      console.error('Error resetting tour:', err);
    }
  }, [user?.id]);

  const skipTour = useCallback(() => {
    setTourState({
      run: false,
      stepIndex: 0,
      showWelcome: false,
    });
    markTourCompleted();
  }, [markTourCompleted]);

  const dismissWelcome = useCallback(() => {
    setTourState(prev => ({ ...prev, showWelcome: false }));
    markTourCompleted();
  }, [markTourCompleted]);

  const handleTourCallback = useCallback((data: CallBackProps) => {
    const { status, type, action, index } = data;

    // Handle tour completion
    if (status === STATUS.FINISHED) {
      setTourState(prev => ({ ...prev, run: false }));
      markTourCompleted();
      return;
    }

    // Handle skip
    if (status === STATUS.SKIPPED) {
      setTourState(prev => ({ ...prev, run: false }));
      markTourCompleted();
      return;
    }

    // Handle step navigation
    if (type === EVENTS.STEP_AFTER) {
      if (action === ACTIONS.NEXT) {
        setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
      } else if (action === ACTIONS.PREV) {
        setTourState(prev => ({ ...prev, stepIndex: index - 1 }));
      }
    }

    // Handle close button
    if (action === ACTIONS.CLOSE) {
      setTourState(prev => ({ ...prev, run: false }));
    }
  }, [markTourCompleted]);

  return (
    <TourContext.Provider
      value={{
        tourState,
        startTour,
        stopTour,
        resetTour,
        skipTour,
        handleTourCallback,
        isTourCompleted,
        dismissWelcome,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};
