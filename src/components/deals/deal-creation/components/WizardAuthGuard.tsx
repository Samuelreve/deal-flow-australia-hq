
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface WizardAuthGuardProps {
  children: React.ReactNode;
}

export const WizardAuthGuard: React.FC<WizardAuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-muted-foreground mb-6">
          You must be logged in to create a deal. Please log in to continue.
        </p>
        <button 
          onClick={() => navigate('/auth')}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
