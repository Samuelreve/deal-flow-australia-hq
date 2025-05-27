
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Activity, Zap, LayoutDashboard, FileText, Settings, Plus, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigationState } from "@/hooks/navigation/useNavigationState";
import AppErrorBoundary from "@/components/common/AppErrorBoundary";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getActiveClass, canNavigate } = useNavigationState();

  // RBAC checks
  const isOnboarded = user?.profile?.onboarding_complete;
  const userRole = user?.profile?.role;
  const isProfessional = userRole === 'lawyer' || userRole === 'admin';
  const isSeller = userRole === 'seller';
  const isAdmin = userRole === 'admin';
  const isBuyer = userRole === 'buyer';

  const handleSignOut = async () => {
    try {
      await logout();
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

  // Don't show sidebar if user can't navigate (not onboarded)
  if (!canNavigate || !isOnboarded) {
    return null;
  }

  return (
    <AppErrorBoundary>
      <aside className="fixed left-0 top-0 z-20 flex h-full w-64 flex-col border-r bg-background pt-16 transition-transform lg:translate-x-0">
        {/* User Profile Section */}
        <div className="flex-shrink-0 p-4">
          <div className="flex items-center justify-center mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.profile?.avatar_url} alt={user?.profile?.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user?.profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-sm">{user?.profile?.name || "User"}</h3>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            {userRole && (
              <p className="text-xs text-muted-foreground capitalize mt-1 bg-primary/10 px-2 py-1 rounded-full">
                {userRole}
              </p>
            )}
          </div>
        </div>
        
        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {/* Core Navigation - Available to all authenticated users */}
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
            
            {/* Create Deal - Only for sellers and admins */}
            {(isSeller || isAdmin) && (
              <li>
                <NavLink
                  to="/create-deal"
                  className={() => `flex items-center rounded-md px-3 py-2 transition-colors ${getActiveClass('/create-deal')}`}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Deal
                </NavLink>
              </li>
            )}
            
            {/* Health Monitoring - Available to all but emphasized for professionals */}
            <li>
              <NavLink
                to="/health-monitoring"
                className={() => `flex items-center rounded-md px-3 py-2 transition-colors ${getActiveClass('/health-monitoring')}`}
              >
                <Activity className="mr-2 h-5 w-5" />
                Health Monitoring
              </NavLink>
            </li>
            
            {/* Advanced Health - Primarily for professionals */}
            {(isProfessional || isAdmin) && (
              <li>
                <NavLink
                  to="/advanced-health-monitoring"
                  className={() => `flex items-center rounded-md px-3 py-2 transition-colors ${getActiveClass('/advanced-health-monitoring')}`}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Advanced Health
                </NavLink>
              </li>
            )}
            
            {/* Professional Directory - For professionals to find each other */}
            {isProfessional && (
              <li>
                <NavLink
                  to="/directory"
                  className={() => `flex items-center rounded-md px-3 py-2 transition-colors ${getActiveClass('/directory')}`}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Directory
                </NavLink>
              </li>
            )}
            
            {/* Settings - Available to all */}
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

        {/* Sign Out Button */}
        <div className="flex-shrink-0 p-4">
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
