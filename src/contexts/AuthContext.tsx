
import React, { createContext, useContext } from 'react';
import { UserProfile, User, AuthContextType } from '@/types/auth';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { authService } from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    session,
    isAuthenticated,
    loading,
    setUser,
    setSession,
    setIsAuthenticated
  } = useAuthSession();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user: authUser, session: authSession } = await authService.login(email, password);
      if (authUser && authSession) {
        setSession(authSession);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      const { user: authUser, session: authSession } = await authService.signup(email, password, name);
      if (authUser) {
        if (authSession) {
          setSession(authSession);
          setIsAuthenticated(true);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const updateUserProfile = async (profile: UserProfile): Promise<boolean> => {
    try {
      const updatedProfile = await authService.updateProfile(profile);
      if (updatedProfile && user) {
        const updatedUser = {
          ...user,
          profile: updatedProfile
        };
        setUser(updatedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Profile update error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated,
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
