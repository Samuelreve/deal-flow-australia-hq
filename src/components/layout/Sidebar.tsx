
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Activity, Zap, LayoutDashboard, FileText, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useNavigationState } from "@/hooks/navigation/useNavigationState";
import AppErrorBoundary from "@/components/common/AppErrorBoundary";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getActiveClass, canNavigate } = useNavigationState();

  const handleSignOut = async () => {
    try {
      logout();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message,
      });
    }
  };

  if (!canNavigate) {
    return null; // Don't show sidebar during onboarding
  }

  return (
    <AppErrorBoundary>
      <aside className="fixed left-0 top-0 z-20 flex h-full w-64 flex-col border-r bg-background pt-16 transition-transform lg:translate-x-0">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-center mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.profile?.avatar_url} alt={user?.profile?.name} />
              <AvatarFallback>{user?.profile?.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center mb-4">
            <h3 className="font-semibold">{user?.profile?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/dashboard"
                className={() => `flex items-center rounded-md px-3 py-2 transition-colors ${getActiveClass('/dashboard')}`}
              >
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/deals"
                className={() => `flex items-center rounded-md px-3 py-2 transition-colors ${getActiveClass('/deals')}`}
              >
                <FileText className="mr-2 h-5 w-5" />
                Deals
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/health-monitoring"
                className={() => `flex items-center rounded-md px-3 py-2 transition-colors ${getActiveClass('/health-monitoring')}`}
              >
                <Activity className="mr-2 h-5 w-5" />
                Health Monitoring
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/advanced-health-monitoring"
                className={() => `flex items-center rounded-md px-3 py-2 transition-colors ${getActiveClass('/advanced-health-monitoring')}`}
              >
                <Zap className="mr-2 h-5 w-5" />
                Advanced Health
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/settings"
                className={() => `flex items-center rounded-md px-3 py-2 transition-colors ${getActiveClass('/settings')}`}
              >
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="p-4">
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </AppErrorBoundary>
  );
};

export default Sidebar;
