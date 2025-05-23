
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">DealPilot</span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium hover:text-primary transition-colors ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium hover:text-primary transition-colors ${
                    isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/deals" 
                  className={`text-sm font-medium hover:text-primary transition-colors ${
                    isActive('/deals') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Deals
                </Link>
                <Link 
                  to="/health-monitoring" 
                  className={`text-sm font-medium hover:text-primary transition-colors ${
                    isActive('/health-monitoring') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Health
                </Link>
              </>
            )}
            <Link 
              to="/demo/contract" 
              className={`text-sm font-medium hover:text-primary transition-colors ${
                isActive('/demo/contract') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Demo
            </Link>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/settings">
                  <Button variant="ghost" size="sm">Settings</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 bg-muted/30">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2023 DealPilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
