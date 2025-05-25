
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const useNavigationState = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const getActiveClass = (path: string) => {
    const isActive = location.pathname === path || 
                    (path !== '/' && location.pathname.startsWith(path));
    
    return isActive 
      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
      : "text-muted-foreground hover:text-foreground hover:bg-accent";
  };

  // Simple check - if user is authenticated and has basic info, allow navigation
  const canNavigate = () => {
    if (!isAuthenticated || !user) {
      return false;
    }
    
    // Basic check - if user has profile data or if profile is null but user exists
    return true;
  };

  return {
    currentPath: location.pathname,
    getActiveClass,
    canNavigate: canNavigate(),
    isOnboarding: false, // Simplified - no complex onboarding logic for now
    user
  };
};
