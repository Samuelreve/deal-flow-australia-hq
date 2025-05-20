
import React from 'react';
import { User, Bell, Link as LinkIcon } from "lucide-react";

interface SettingsSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="hidden lg:block">
      <div className="space-y-1 sticky top-8">
        <button 
          onClick={() => onTabChange("account")}
          className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
            activeTab === "account" 
              ? "bg-primary text-primary-foreground"
              : "hover:bg-secondary"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="font-medium">Account</span>
        </button>
        
        <button 
          onClick={() => onTabChange("notifications")}
          className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
            activeTab === "notifications" 
              ? "bg-primary text-primary-foreground"
              : "hover:bg-secondary"
          }`}
        >
          <Bell className="h-5 w-5" />
          <span className="font-medium">Notifications</span>
        </button>
        
        <button 
          onClick={() => onTabChange("professional")}
          className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
            activeTab === "professional" 
              ? "bg-primary text-primary-foreground"
              : "hover:bg-secondary"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="font-medium">Professional Profile</span>
        </button>
        
        <button 
          onClick={() => onTabChange("integrations")}
          className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
            activeTab === "integrations" 
              ? "bg-primary text-primary-foreground"
              : "hover:bg-secondary"
          }`}
        >
          <LinkIcon className="h-5 w-5" />
          <span className="font-medium">Integrations</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsSidebar;
