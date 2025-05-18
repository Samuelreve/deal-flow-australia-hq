
import { createContext, useContext, ReactNode, useCallback } from "react";
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
    setLoading,
    setUser,
    setIsAuthenticated
  } = useAuthSession();
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const data = await authService.login(email, password);
      
      if (data.user) {
        // Session will be handled by the onAuthStateChange listener
        toast({
          title: "Login successful",
          description: `Welcome back!`,
        });
        
        // Force update state immediately to ensure redirection works
        setUser(data.user);
        setIsAuthenticated(true);
        
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
  }, [setLoading, toast, setUser, setIsAuthenticated]);

  const signup = useCallback(async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Standard signup - will need email confirmation unless disabled in Supabase dashboard
      const data = await authService.signup(email, password, name);
      
      if (data?.user) {
        if (data.session) {
          // User is automatically logged in with a session
          console.log("Signup successful with session, user logged in", data.user);
          
          // Force update state immediately
          setUser(data.user);
          setIsAuthenticated(true);
          
          toast({
            title: "Account created successfully",
            description: "Welcome to DealPilot!",
          });
          return true;
        } else {
          // This happens if email confirmation is required in Supabase settings
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
  }, [setLoading, toast, navigate, setUser, setIsAuthenticated]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      // Session change will be handled by the onAuthStateChange listener
      sonnerToast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      sonnerToast.error("Failed to log out");
    }
  }, [navigate]);

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
