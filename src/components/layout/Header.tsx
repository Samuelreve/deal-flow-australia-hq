
import { Settings, User, Search, Brain, UserCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationsDropdown from "@/components/notifications/NotificationsDropdown";
import { Input } from "@/components/ui/input";
import AIToolsModal from "@/components/ai/AIToolsModal";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  showSidebar?: boolean;
  toggleSidebar?: () => void;
}

const Header = ({ showSidebar = true, toggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAITools, setShowAITools] = useState(false);
  
  // RBAC checks
  const isLoggedIn = !!user;
  const isOnboarded = user?.profile?.onboarding_complete;
  const userRole = user?.profile?.role;
  const isProfessional = userRole === 'lawyer' || userRole === 'admin';
  const isSeller = userRole === 'seller';
  const isAdmin = userRole === 'admin';
  
  // Check if user has access to AI tools based on role
  const canAccessAITools = isLoggedIn && isOnboarded && userRole && 
    ['admin', 'seller', 'buyer', 'lawyer'].includes(userRole.toLowerCase());
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message || "Failed to log out. Please try again.",
      });
    }
  };
  
  const handleNavigateToProfile = () => {
    navigate('/profile');
  };
  
  const handleNavigateToSettings = () => {
    navigate('/settings');
  };
  
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm flex h-16 items-center px-4 md:px-6">
      {/* Logo */}
      <div className="hidden md:block">
        <Link to={isLoggedIn && isOnboarded ? "/dashboard" : "/"} className="hover:opacity-80 transition-opacity">
          <h1 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            DealPilot
          </h1>
        </Link>
      </div>
      
      {/* Main Navigation Links - Only for authenticated and onboarded users */}
      {isLoggedIn && isOnboarded && (
        <nav className="hidden lg:flex ml-8 space-x-6">
          <Link 
            to="/dashboard" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            to="/deals" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Deals
          </Link>
          {(isSeller || isAdmin) && (
            <Link 
              to="/create-deal" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Create Deal
            </Link>
          )}
          {isProfessional && (
            <Link 
              to="/health-monitoring" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Health Monitoring
            </Link>
          )}
        </nav>
      )}
      
      {/* Search Bar - Only for authenticated users */}
      {isLoggedIn && isOnboarded && (
        <div className="ml-auto mr-4 hidden md:block max-w-md w-full">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search deals, documents..." 
              className="w-full pl-9 bg-background border-muted"
            />
          </div>
        </div>
      )}
      
      {/* Right Side Actions */}
      <div className="flex items-center ml-auto space-x-3">
        {/* AI Tools Button - Only for users with access */}
        {canAccessAITools && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAITools(true)}
            className="bg-primary/5 border-primary/20"
          >
            <Brain className="mr-2 h-4 w-4 text-primary" />
            AI Assistant
          </Button>
        )}
        
        {/* Notifications - Only for authenticated users */}
        {isLoggedIn && isOnboarded && <NotificationsDropdown />}
        
        {/* User Menu - Only for authenticated users */}
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full" size={null}>
                <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                  <AvatarImage src={user?.profile?.avatar_url} alt={user?.profile?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10">
                    {user?.profile?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.profile?.name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "user@example.com"}
                  </p>
                  {userRole && (
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {userRole}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isOnboarded && (
                <>
                  <DropdownMenuItem onClick={handleNavigateToProfile} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleNavigateToSettings} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /* Login/Signup buttons for non-authenticated users */
          <div className="flex items-center space-x-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">
                Sign up
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      {/* AI Tools Modal */}
      <AIToolsModal 
        isOpen={showAITools} 
        onClose={() => setShowAITools(false)} 
      />
    </header>
  );
};

export default Header;
