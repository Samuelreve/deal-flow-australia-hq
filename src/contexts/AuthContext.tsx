
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  profile?: {
    name?: string;
    avatar_url?: string;
    role?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name?: string) => Promise<void>;
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
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        profile: {
          name: email.split('@')[0],
          role: 'user'
        }
      };
      
      setUser(demoUser);
      localStorage.setItem('demo-user', JSON.stringify(demoUser));
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    setLoading(true);
    try {
      // Simulate signup API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoUser: User = {
        id: '1',
        email,
        name: name || email.split('@')[0],
        profile: {
          name: name || email.split('@')[0],
          role: 'user'
        }
      };
      
      setUser(demoUser);
      localStorage.setItem('demo-user', JSON.stringify(demoUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('demo-user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    signup
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
