
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  User,
  ArrowRight,
  Activity,
  Zap,
  Menu,
  X,
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
import { useNavigationState } from "@/hooks/navigation/useNavigationState";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AppErrorBoundary from "@/components/common/AppErrorBoundary";

const NavBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { getActiveClass, canNavigate } = useNavigationState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const getInitials = () => {
    if (!user?.profile?.name) return "U";
    
    const nameParts = user.profile.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  const navItems = isAuthenticated && canNavigate ? [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/deals", icon: FileText, label: "Deals" },
    { to: "/health-monitoring", icon: Activity, label: "Health" },
    { to: "/advanced-health-monitoring", icon: Zap, label: "Advanced" },
  ] : [
    { to: "/", label: "Home" },
    { to: "/demo/contract", label: "Demo" },
  ];

  const MobileNavItems = () => (
    <div className="flex flex-col space-y-4 p-4">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`text-sm font-medium transition-colors ${
            isActive(item.to)
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex items-center gap-2">
            {item.icon && <item.icon className="h-4 w-4" />}
            <span>{item.label}</span>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <AppErrorBoundary>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Trustroom.ai
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.to)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-1">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <MobileNavItems />
                  {isAuthenticated && (
                    <div className="mt-6 p-4 border-t">
                      <Button variant="outline" className="w-full" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Auth Actions */}
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
                <DropdownMenuContent align="end" className="w-56">
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
              <div className="hidden md:flex items-center space-x-3">
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
              </div>
            )}
          </div>
        </div>
      </header>
    </AppErrorBoundary>
  );
};

export default NavBar;
