
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import {
  BarChart, Briefcase, Bell, User, Users, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { formatDate } from '@/utils/formatDate';

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [isCompact, setIsCompact] = useState(false);

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
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      authRequired: true
    }
  ];

  return (
    <aside className={cn(
      "h-screen border-r bg-background fixed left-0 top-0 z-30 transition-all duration-300",
      isCompact ? "w-20" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        <div className={cn(
          "p-4 border-b flex items-center justify-between",
          isCompact && "justify-center"
        )}>
          <h2 className={cn(
            "text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70",
            isCompact && "hidden"
          )}>
            DealPilot
          </h2>
          {isCompact && (
            <div className="font-bold text-xl text-primary">DP</div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("rounded-full", isCompact && "hidden")}
            onClick={() => setIsCompact(true)}
          >
            <span className="sr-only">Collapse</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          {isCompact && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full absolute -right-3 top-4 bg-background border shadow-sm"
              onClick={() => setIsCompact(false)}
            >
              <span className="sr-only">Expand</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className={cn("py-6 px-3 flex-1")}>
          <div className={cn(
            "mb-6 px-3",
            isCompact ? "text-center" : ""
          )}>
            <div className={cn(
              "text-xs uppercase text-muted-foreground font-medium tracking-wider mb-2",
              isCompact && "hidden"
            )}>
              {formatDate(new Date())}
            </div>
          </div>

          <div>
            <h3 className={cn(
              "text-xs uppercase text-muted-foreground font-medium tracking-wider mb-4 px-3",
              isCompact && "sr-only"
            )}>
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
                      "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all",
                      pathname === item.href
                        ? "bg-primary text-white" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      isCompact && "justify-center"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5",
                      isCompact ? "mx-auto" : "mr-3",
                      pathname === item.href
                        ? "text-white" 
                        : "text-muted-foreground"
                    )} />
                    {!isCompact && <span>{item.name}</span>}
                  </Link>
                ))
              }
            </nav>
          </div>
        </div>
        
        <div className="p-3 mt-auto border-t">
          <div className={cn(
            "text-xs text-muted-foreground",
            isCompact && "text-center"
          )}>
            © {new Date().getFullYear()} DealPilot
          </div>
        </div>
      </div>
    </aside>
  );
};

// Simple chevron icons to avoid importing the full lucide icons
const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default Sidebar;
