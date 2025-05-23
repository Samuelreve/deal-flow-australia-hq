import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole, User, AuthContextType } from '@/types/auth';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

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
    // Simulate checking for existing session
    const checkSession = async () => {
      try {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if user is stored in localStorage (demo purposes)
        const storedUser = localStorage.getItem('demo-user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          // Create a mock Session object with a mock Supabase user
          const mockSupabaseUser: SupabaseUser = {
            id: parsedUser.id,
            email: parsedUser.email,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
          };
          
          setSession({
            user: mockSupabaseUser,
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600,
            token_type: 'bearer'
          } as Session);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoProfile: UserProfile = {
        id: '1',
        email: email,
        name: email.split('@')[0],
        role: 'buyer' as UserRole,
        avatar_url: undefined,
        company: undefined,
        phone: undefined,
        is_professional: false,
        professional_headline: undefined,
        professional_bio: undefined,
        professional_firm_name: undefined,
        professional_contact_email: undefined,
        professional_phone: undefined,
        professional_website: undefined,
        professional_location: undefined,
        professional_specializations: undefined,
        onboarding_complete: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const demoUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: 'buyer' as UserRole,
        profile: demoProfile
      };
      
      setUser(demoUser);
      // Create a mock Session object with a mock Supabase user
      const mockSupabaseUser: SupabaseUser = {
        id: demoUser.id,
        email: demoUser.email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      };
      
      setSession({
        user: mockSupabaseUser,
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer'
      } as Session);
      localStorage.setItem('demo-user', JSON.stringify(demoUser));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate signup API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoProfile: UserProfile = {
        id: '1',
        email: email,
        name: name || email.split('@')[0],
        role: 'buyer' as UserRole,
        avatar_url: undefined,
        company: undefined,
        phone: undefined,
        is_professional: false,
        professional_headline: undefined,
        professional_bio: undefined,
        professional_firm_name: undefined,
        professional_contact_email: undefined,
        professional_phone: undefined,
        professional_website: undefined,
        professional_location: undefined,
        professional_specializations: undefined,
        onboarding_complete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const demoUser: User = {
        id: '1',
        email,
        name: name || email.split('@')[0],
        role: 'buyer' as UserRole,
        profile: demoProfile
      };
      
      setUser(demoUser);
      // Create a mock Session object with a mock Supabase user
      const mockSupabaseUser: SupabaseUser = {
        id: demoUser.id,
        email: demoUser.email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      };
      
      setSession({
        user: mockSupabaseUser,
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer'
      } as Session);
      localStorage.setItem('demo-user', JSON.stringify(demoUser));
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profile: UserProfile): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      // In a real app, you'd call an API here
      // For demo purposes, we'll just update the local state
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          ...profile,
          updated_at: new Date().toISOString()
        }
      };
      
      setUser(updatedUser);
      localStorage.setItem('demo-user', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('demo-user');
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    signup,
    updateUserProfile,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
