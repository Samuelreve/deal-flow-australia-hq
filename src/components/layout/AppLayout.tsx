
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AppLayoutProps {
  children: ReactNode;
  requiredRoles?: string[];
}

const AppLayout = ({ children, requiredRoles = [] }: AppLayoutProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [loadingContent, setLoadingContent] = useState(true);
  
  // Set up a timeout to stop showing the loader after a reasonable time
  useEffect(() => {
    if (!loading) {
      // Give a short delay to allow other data to load
      const timer = setTimeout(() => {
        setLoadingContent(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);
  
  // Error handling for authentication issues
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Uncomment when authentication is required
      // navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);
  
  if (loading || loadingContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Comment out authentication checks to allow viewing without login
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }
  
  // If specific roles are required, check if user has permission
  // if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
  //   return <Navigate to="/unauthorized" replace />;
  // }
  
  // Create a mock user if none exists
  const mockUser = user || {
    id: "mock-user-id",
    name: "Demo User",
    email: "demo@example.com",
    role: "admin",
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64 transition-all duration-300">
        <Header />
        <main className="p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
