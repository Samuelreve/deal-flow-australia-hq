
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Activity, 
  Bot, 
  Settings, 
  LogOut,
  Plus,
  Bell,
  ChevronLeft,
  User,
  CreditCard,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, tourId: 'sidebar-dashboard' },
  { name: 'Deals', href: '/deals', icon: FileText, tourId: 'sidebar-deals' },
  { name: 'Health Monitoring', href: '/health-monitoring', icon: Activity, tourId: 'sidebar-health' },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Bot, tourId: 'sidebar-ai' },
];

const secondaryNavigation = [
  { name: 'Create Deal', href: '/create-deal', icon: Plus, tourId: 'sidebar-create-deal' },
  { name: 'Notifications', href: '/notifications', icon: Bell, tourId: 'sidebar-notifications' },
  { name: 'Pricing', href: '/pricing', icon: CreditCard, tourId: 'sidebar-pricing' },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavClick = (href: string) => {
    navigate(href);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const NavItem = ({ item, isActive }: { item: typeof navigation[0] & { tourId?: string }; isActive: boolean }) => {
    const showLabel = isMobile ? true : !collapsed;
    const content = (
      <button
        data-tour={item.tourId}
        onClick={() => handleNavClick(item.href)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
        )}
      >
        <item.icon className={cn('h-5 w-5 flex-shrink-0', !isMobile && collapsed && 'mx-auto')} />
        {showLabel && <span>{item.name}</span>}
      </button>
    );

    if (!isMobile && collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className={cn('flex items-center p-3', isMobile ? 'justify-between' : collapsed ? 'justify-center' : 'justify-end')}>
        {isMobile ? (
          <>
            <img src="/trustroom-logo.webp" alt="Trustroom.ai" className="h-10" />
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileClose}
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
          </Button>
        )}
      </div>

      {/* Logo - only when expanded on desktop */}
      {!isMobile && !collapsed && (
        <div className="flex flex-col items-center pb-4 px-4">
          <img src="/trustroom-logo.webp" alt="Trustroom.ai" className="h-24" />
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            isActive={location.pathname === item.href || location.pathname.startsWith(item.href + '/')}
          />
        ))}

        <Separator className="my-4 bg-sidebar-border" />

        {secondaryNavigation.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            isActive={location.pathname === item.href}
          />
        ))}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        {/* Settings */}
        <div data-tour="sidebar-settings">
          <NavItem
            item={{ name: 'Settings', href: '/settings', icon: Settings, tourId: 'sidebar-settings' }}
            isActive={location.pathname === '/settings'}
          />
        </div>

        {/* User Profile */}
        <div 
          data-tour="user-profile"
          className={cn(
            'mt-3 flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer',
            !isMobile && collapsed && 'justify-center'
          )}
          onClick={() => handleNavClick('/profile')}
        >
          <Avatar className="h-9 w-9 border-2 border-sidebar-primary/30">
            <AvatarImage src={user?.profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-sm">
              {user?.profile?.name ? getInitials(user.profile.name) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          {(isMobile || !collapsed) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.profile?.name || 'User'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.profile?.email}
              </p>
            </div>
          )}
        </div>

        {/* Logout */}
        {!isMobile && collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="w-full mt-2 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full mt-2 justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        )}
      </div>
    </>
  );

  // Mobile: overlay drawer
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
          />
        )}
        {/* Drawer */}
        <aside
          className={cn(
            'fixed left-0 top-0 z-50 h-screen w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop: fixed sidebar
  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>
    </TooltipProvider>
  );
};

export default AppSidebar;
