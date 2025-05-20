
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Link as LinkIcon } from "lucide-react";

interface SettingsMobileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SettingsMobileTabs: React.FC<SettingsMobileTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full lg:hidden">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="account">
          <span className="flex flex-col items-center">
            <User className="h-4 w-4 mb-1" />
            <span className="text-xs">Account</span>
          </span>
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <span className="flex flex-col items-center">
            <Bell className="h-4 w-4 mb-1" />
            <span className="text-xs">Notifications</span>
          </span>
        </TabsTrigger>
        <TabsTrigger value="professional">
          <span className="flex flex-col items-center">
            <User className="h-4 w-4 mb-1" />
            <span className="text-xs">Professional</span>
          </span>
        </TabsTrigger>
        <TabsTrigger value="integrations">
          <span className="flex flex-col items-center">
            <LinkIcon className="h-4 w-4 mb-1" />
            <span className="text-xs">Integrations</span>
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default SettingsMobileTabs;
