
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  Bell,
  Briefcase,
  Plus,
  User,
  Activity,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Deals", href: "/deals", icon: Briefcase },
    { name: "Deal Health", href: "/deals/health", icon: TrendingUp },
    { name: "Create Deal", href: "/deals/create", icon: Plus },
    { name: "Contracts", href: "/contracts", icon: FileText },
    { name: "Professionals", href: "/professionals", icon: Users },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Activity", href: "/activity", icon: Activity },
  ];

  const bottomNavigation = [
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link to="/dashboard" className="text-xl font-bold text-primary">
            DealsFlow
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        location.pathname === item.href
                          ? "bg-gray-50 text-primary"
                          : "text-gray-700 hover:text-primary hover:bg-gray-50",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      )}
                    >
                      <item.icon
                        className={cn(
                          location.pathname === item.href ? "text-primary" : "text-gray-400 group-hover:text-primary",
                          "h-6 w-6 shrink-0"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="mt-auto">
              <ul role="list" className="-mx-2 space-y-1">
                {bottomNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        location.pathname === item.href
                          ? "bg-gray-50 text-primary"
                          : "text-gray-700 hover:text-primary hover:bg-gray-50",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      )}
                    >
                      <item.icon
                        className={cn(
                          location.pathname === item.href ? "text-primary" : "text-gray-400 group-hover:text-primary",
                          "h-6 w-6 shrink-0"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
