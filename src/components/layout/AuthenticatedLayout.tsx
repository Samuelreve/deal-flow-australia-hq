
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import AppSidebar from './AppSidebar';
import { TourProvider } from '@/contexts/TourContext';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import WelcomeModal from '@/components/onboarding/WelcomeModal';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <TourProvider>
      <div className="min-h-screen bg-background">
        <AppSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <main 
          className={cn(
            'min-h-screen transition-all duration-300',
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          )}
        >
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>

        {/* Onboarding Tour */}
        <OnboardingTour />
        <WelcomeModal />
      </div>
    </TourProvider>
  );
};

export default AuthenticatedLayout;
