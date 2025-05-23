
import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types/auth';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  profile?: {
    name?: string;
    avatar_url?: string;
    role?: string;
    email?: string;
    id?: string;
    onboarding_complete?: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  session: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  updateUserProfile?: (profile: UserProfile) => Promise<boolean>;
  setUser: (user: User | null) => void;
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
  const [session, setSession] = useState<any>(null);
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
          setSession({ user: parsedUser });
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
      
      const demoUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: 'user',
        profile: {
          name: email.split('@')[0],
          role: 'user',
          email: email,
          id: '1',
          onboarding_complete: true
        }
      };
      
      setUser(demoUser);
      setSession({ user: demoUser });
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
      
      const demoUser: User = {
        id: '1',
        email,
        name: name || email.split('@')[0],
        role: 'user',
        profile: {
          name: name || email.split('@')[0],
          role: 'user',
          email: email,
          id: '1',
          onboarding_complete: false
        }
      };
      
      setUser(demoUser);
      setSession({ user: demoUser });
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
          onboarding_complete: profile.onboarding_complete || user.profile?.onboarding_complete
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

  const value = {
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
