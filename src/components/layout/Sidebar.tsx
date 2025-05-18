
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  Users,
  MessageSquare,
  Settings,
  BarChart,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Navigation items based on user role
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["seller", "buyer", "lawyer", "admin"],
    },
    {
      name: "Deals",
      href: "/deals",
      icon: FileText,
      roles: ["seller", "buyer", "lawyer", "admin"],
    },
    {
      name: "Users",
      href: "/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageSquare,
      roles: ["seller", "buyer", "lawyer", "admin"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart,
      roles: ["admin", "lawyer"],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["seller", "buyer", "lawyer", "admin"],
    },
  ];
  
  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => 
    user?.profile && item.roles.includes(user.profile.role)
  );
  
  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 h-screen bg-sidebar border-r border-border hidden lg:flex flex-col">
      <div className="h-16 flex items-center border-b border-sidebar-border px-6">
        <div className="text-xl font-semibold text-sidebar-foreground">
          DealPilot
        </div>
      </div>
      
      <div className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={cn(
              "w-full justify-start h-10 px-4 text-sidebar-foreground hover:bg-sidebar-accent",
              location.pathname === item.href && "bg-sidebar-accent font-medium"
            )}
            onClick={() => navigate(item.href)}
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.name}
          </Button>
        ))}
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-primary mr-2 flex items-center justify-center text-white font-medium">
            {user?.profile?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.profile?.name}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {user?.profile?.role && (user.profile.role.charAt(0).toUpperCase() + user.profile.role.slice(1))}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => logout()}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
