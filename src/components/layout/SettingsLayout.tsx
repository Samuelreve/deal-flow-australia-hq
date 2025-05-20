
import React from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SettingsLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ 
  children,
  title = "Settings" 
}) => {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <Settings className="h-6 w-6 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        
        <Separator className="mb-8" />
        
        {children}
      </div>
    </AppLayout>
  );
};

export default SettingsLayout;
