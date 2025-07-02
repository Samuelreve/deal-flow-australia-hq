
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Deal {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DealRoomHeaderProps {
  deal: Deal;
  userRole: string | null;
}

const DealRoomHeader: React.FC<DealRoomHeaderProps> = ({ deal, userRole }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/deals')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Deals
        </Button>
        
        {userRole && (
          <Badge variant="outline" className="capitalize">
            <User className="h-3 w-3 mr-1" />
            {userRole}
          </Badge>
        )}
      </div>
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {deal.title}
          </h1>
          
          <div className="flex items-center space-x-4 mb-3">
            <Badge className={getStatusColor(deal.status)}>
              {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
            </Badge>
            
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              Created {new Date(deal.created_at).toLocaleDateString()}
            </div>
          </div>
          
          {deal.description && (
            <p className="text-gray-600 max-w-2xl">
              {deal.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealRoomHeader;
