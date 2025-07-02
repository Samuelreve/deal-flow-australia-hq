
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, FileText, CheckCircle, BarChart3 } from 'lucide-react';

interface DealRoomTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string | null;
}

const DealRoomTabs: React.FC<DealRoomTabsProps> = ({ activeTab, onTabChange, userRole }) => {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Deal summary and participants'
    },
    {
      id: 'invitations',
      label: 'Invitations',
      icon: Users,
      description: 'Manage participant invitations',
      adminOnly: true
    },
    {
      id: 'documents',
      label: 'Document Reviews',
      icon: FileText,
      description: 'Review and approve documents'
    },
    {
      id: 'completion',
      label: 'Deal Completion',
      icon: CheckCircle,
      description: 'Finalize the deal'
    }
  ];

  const visibleTabs = tabs.filter(tab => {
    if (tab.adminOnly && userRole !== 'admin' && userRole !== 'seller') {
      return false;
    }
    return true;
  });

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8" aria-label="Tabs">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                ${isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default DealRoomTabs;
