
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Login failed', {
          description: error.message
        });
        return false;
      }

      if (data.user) {
        toast.success('Welcome back!', {
          description: 'You have successfully signed in.'
        });
        return true;
      }

      return false;
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message || 'An unexpected error occurred'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          }
        }
      });

      if (error) {
        toast.error('Sign up failed', {
          description: error.message
        });
        return false;
      }

      if (data.user) {
        toast.success('Account created!', {
          description: 'Please check your email to verify your account.'
        });
        return true;
      }

      return false;
    } catch (error: any) {
      toast.error('Sign up failed', {
        description: error.message || 'An unexpected error occurred'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Logout failed', {
          description: error.message
        });
      } else {
        toast.success('Logged out successfully');
      }
    } catch (error: any) {
      toast.error('Logout failed', {
        description: error.message || 'An unexpected error occurred'
      });
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        toast.error('Reset failed', {
          description: error.message
        });
        return false;
      }
      
      toast.success('Reset email sent', {
        description: 'Check your email for password reset instructions.'
      });
      return true;
    } catch (error: any) {
      toast.error('Reset failed', {
        description: error.message || 'An unexpected error occurred'
      });
      return false;
    }
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
