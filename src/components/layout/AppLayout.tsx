
import { ReactNode, useEffect } from "react";
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
  
  // Error handling for authentication issues
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Uncomment when authentication is required
      // navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);
  
  if (loading) {
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
      <div className="lg:pl-64">
        <Header />
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
