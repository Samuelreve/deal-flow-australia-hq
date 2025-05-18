
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import {
  BarChart, Briefcase, Bell, User, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Navigation links
  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart,
      authRequired: true
    },
    {
      name: 'Deals',
      href: '/deals',
      icon: Briefcase,
      authRequired: true
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      authRequired: true
    },
    {
      name: 'Professionals',
      href: '/professionals',
      icon: Users,
      authRequired: false
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      authRequired: true
    }
  ];

  return (
    <aside className="h-screen w-64 border-r bg-background fixed left-0 top-0 z-30">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">DealPilot</h2>
        </div>
        
        <div className="py-6 px-3 flex-1">
          <h3 className="text-xs uppercase text-muted-foreground font-medium tracking-wider mb-4 px-3">
            Navigation
          </h3>
          <nav className="space-y-1">
            {navItems
              .filter(item => !item.authRequired || user)
              .map((item) => (
                <Link 
                  key={item.href} 
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-md",
                    pathname === item.href
                      ? "bg-secondary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5",
                    pathname === item.href
                      ? "text-foreground" 
                      : "text-muted-foreground"
                  )} />
                  {item.name}
                </Link>
              ))
            }
          </nav>
        </div>
        
        <div className="p-3 mt-auto border-t">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DealPilot
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
