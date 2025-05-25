
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile } from '@/types/auth';
import { useUserProfile } from '@/hooks/auth/useUserProfile';

// Extended User type that includes profile
interface User {
  id: string;
  email: string;
  profile: UserProfile | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUserProfile: (profile: UserProfile) => Promise<boolean>;
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
  const { fetchUserProfile, createUserProfile } = useUserProfile();

  const updateUserProfile = async (profile: UserProfile): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Update the user state with the new profile
      setUser({
        ...user,
        profile: profile
      });
      
      return true;
    } catch (error) {
      console.error('Error updating user profile in context:', error);
      return false;
    }
  };

  const createUserFromSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User> => {
    let profile = await fetchUserProfile(supabaseUser.id);
    
    if (!profile) {
      // Create profile if it doesn't exist
      profile = await createUserProfile(
        supabaseUser.id,
        supabaseUser.email || '',
        supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User'
      );
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      profile: profile
    };
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          try {
            const userData = await createUserFromSupabaseUser(session.user);
            setUser(userData);
          } catch (error) {
            console.error('Error creating user data:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        try {
          const userData = await createUserFromSupabaseUser(session.user);
          setUser(userData);
        } catch (error) {
          console.error('Error creating user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, createUserProfile]);

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
    resetPassword,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
