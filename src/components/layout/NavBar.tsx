
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  User,
  ArrowRight,
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

const NavBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message || "Failed to log out. Please try again.",
      });
    }
  };

  // Get user's initials for avatar fallback
  const getInitials = () => {
    if (!user?.profile?.name) return "U";
    
    const nameParts = user.profile.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            DealPilot
          </span>
        </Link>

        {/* Main Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </div>
              </Link>
              <Link
                to="/deals"
                className={`text-sm font-medium transition-colors ${
                  isActive("/deals")
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>Deals</span>
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                Home
              </Link>
              <Link
                to="/demo/contract"
                className={`text-sm font-medium transition-colors ${
                  isActive("/demo/contract")
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                Demo
              </Link>
            </>
          )}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profile?.avatar_url} alt={user?.profile?.name} />
                    <AvatarFallback className="bg-primary/10">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">
                  Sign up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
