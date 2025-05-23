
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationState {
  currentPath: string;
  isHealthMonitoring: boolean;
  isAdvancedHealth: boolean;
  isDashboard: boolean;
  isDeals: boolean;
  isSettings: boolean;
  isProfile: boolean;
  isOnboarding: boolean;
  canNavigate: boolean;
  breadcrumbs: Array<{ label: string; path: string }>;
}

export const useNavigationState = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [navState, setNavState] = useState<NavigationState>({
    currentPath: location.pathname,
    isHealthMonitoring: false,
    isAdvancedHealth: false,
    isDashboard: false,
    isDeals: false,
    isSettings: false,
    isProfile: false,
    isOnboarding: false,
    canNavigate: true,
    breadcrumbs: []
  });

  useEffect(() => {
    const path = location.pathname;
    
    const breadcrumbs = generateBreadcrumbs(path);
    const canNavigate = isAuthenticated && user?.profile?.onboarding_complete;
    
    setNavState({
      currentPath: path,
      isHealthMonitoring: path === '/health-monitoring',
      isAdvancedHealth: path === '/advanced-health-monitoring',
      isDashboard: path === '/dashboard',
      isDeals: path.startsWith('/deals'),
      isSettings: path.startsWith('/settings'),
      isProfile: path === '/profile',
      isOnboarding: path.startsWith('/onboarding'),
      canNavigate,
      breadcrumbs
    });
  }, [location.pathname, isAuthenticated, user?.profile?.onboarding_complete]);

  const generateBreadcrumbs = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Custom labels for specific routes
      switch (segment) {
        case 'health-monitoring':
          label = 'Health Monitoring';
          break;
        case 'advanced-health-monitoring':
          label = 'Advanced Health';
          break;
        case 'onboarding':
          label = 'Setup';
          break;
        default:
          label = label.replace(/-/g, ' ');
      }
      
      breadcrumbs.push({ label, path: currentPath });
    });
    
    return breadcrumbs;
  };

  const navigateWithCheck = (path: string) => {
    if (!navState.canNavigate && !path.startsWith('/onboarding')) {
      navigate('/onboarding/intent');
      return;
    }
    navigate(path);
  };

  const getActiveClass = (path: string) => {
    if (path === navState.currentPath) return 'bg-muted text-primary font-medium';
    if (path !== '/' && navState.currentPath.startsWith(path)) return 'bg-muted/50 text-primary';
    return 'text-muted-foreground hover:bg-muted hover:text-primary';
  };

  return {
    ...navState,
    navigateWithCheck,
    getActiveClass
  };
};
