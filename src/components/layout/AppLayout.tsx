
import React from 'react';
import NavBar from './NavBar';
import CopilotWidget from '@/components/copilot/CopilotWidget';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <NavBar />
      
      {/* Main Content */}
      <main className="flex-1 bg-muted/30 min-h-0">
        <div className="h-full">
          {children}
        </div>
      </main>
      
      {/* Global Deal Copilot (fixed bottom-right) */}
      <CopilotWidget />
      
      {/* Footer - Always at bottom */}
      <footer className="bg-white border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2023 Trustroom.ai. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
