
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import {
  BarChart, Briefcase, Bell, Settings, User, Users
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
    <aside className="pb-12 w-64 hidden md:block">
      <div className="space-y-4 py-4 sticky top-0">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {navItems
              .filter(item => !item.authRequired || user)
              .map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === item.href 
                      ? "bg-secondary" 
                      : "hover:bg-secondary/50"
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              ))
            }
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
