
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

// User types
export type UserRole = "seller" | "buyer" | "lawyer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Mock users for demonstration
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "seller@example.com",
    name: "John Seller",
    role: "seller",
    avatar: "https://ui-avatars.com/api/?name=John+Seller&background=0D8ABC&color=fff",
  },
  {
    id: "2",
    email: "buyer@example.com",
    name: "Jane Buyer",
    role: "buyer",
    avatar: "https://ui-avatars.com/api/?name=Jane+Buyer&background=0D8ABC&color=fff",
  },
  {
    id: "3", 
    email: "lawyer@example.com",
    name: "Mike Lawyer",
    role: "lawyer",
    avatar: "https://ui-avatars.com/api/?name=Mike+Lawyer&background=0D8ABC&color=fff",
  },
  {
    id: "4",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
  }
];

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // For demo purposes, we'll simulate authentication with mock users
    // In a real application, this would be an API call
    try {
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 1000));
      
      // Find the user by email
      const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser && password === "password") { // Simple password check for demo
        setUser(foundUser);
        setIsAuthenticated(true);
        
        // Store user in localStorage for persistence
        localStorage.setItem("user", JSON.stringify(foundUser));
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${foundUser.name}!`,
        });
        
        return true;
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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
