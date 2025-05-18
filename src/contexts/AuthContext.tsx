
import { createContext, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import { authService } from "@/services/authService";
import { useAuthSession } from "@/hooks/useAuthSession";
import { AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    session,
    isAuthenticated,
    loading,
    setLoading
  } = useAuthSession();
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const data = await authService.login(email, password);
      
      if (data.user) {
        // Session will be handled by the onAuthStateChange listener
        toast({
          title: "Login successful",
          description: `Welcome back!`,
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Direct signup without email confirmation requirements
      const data = await authService.signup(email, password, name);
      
      if (data?.user) {
        if (data.session) {
          // User should be automatically logged in with a session
          toast({
            title: "Account created successfully",
            description: "Welcome to DealPilot!",
          });
          return true;
        } else {
          // Fallback in case session isn't returned (shouldn't happen with our settings)
          toast({
            title: "Account created",
            description: "Please log in with your new account",
          });
          navigate("/login");
          return false;
        }
      }
      
      return false;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      // Session change will be handled by the onAuthStateChange listener
      sonnerToast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      sonnerToast.error("Failed to log out");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isAuthenticated, 
      login, 
      signup,
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
