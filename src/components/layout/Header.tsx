
import { Settings, User, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

interface HeaderProps {
  showSidebar?: boolean;
  toggleSidebar?: () => void;
}

const Header = ({ showSidebar = true, toggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleNavigateToProfile = () => {
    navigate('/profile');
  };
  
  const handleNavigateToSettings = () => {
    navigate('/settings');
  };
  
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm flex h-16 items-center px-4 md:px-6">
      <div className="hidden md:block">
        <h1 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          DealPilot
        </h1>
      </div>
      
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
      
      <div className="flex items-center ml-auto space-x-3">
        <NotificationsDropdown />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full" size={null}>
              <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <AvatarImage src={user?.profile?.avatar_url} alt={user?.profile?.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10">
                  {user?.profile?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.profile?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || "user@example.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleNavigateToProfile} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleNavigateToSettings} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
