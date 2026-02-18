
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import AppSidebar from './AppSidebar';
import { TourProvider } from '@/contexts/TourContext';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import WelcomeModal from '@/components/onboarding/WelcomeModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <TourProvider>
      <div className="min-h-screen bg-background">
        <AppSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        
        {/* Mobile Header */}
        {isMobile && (
          <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <img src="/trustroom-logo.webp" alt="Trustroom.ai" className="h-8" />
            <div className="w-9" /> {/* Spacer for centering */}
          </header>
        )}

        <main 
          className={cn(
            'min-h-screen transition-all duration-300',
            isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-16' : 'ml-64'
          )}
        >
          <div className={cn(
            isMobile ? 'p-4' : 'p-6 lg:p-8'
          )}>
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
