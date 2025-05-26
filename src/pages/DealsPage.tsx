
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, TrendingUp } from 'lucide-react';

const DealsPage = () => {
  const navigate = useNavigate();

  // Mock deals data
  const mockDeals = [
    {
      id: 'demo-deal-1',
      title: 'Tech Startup Acquisition',
      status: 'active',
      healthScore: 85,
      nextMilestone: 'Due Diligence Review',
      documentsCount: 12
    },
    {
      id: 'demo-deal-2', 
      title: 'Restaurant Chain Purchase',
      status: 'pending',
      healthScore: 72,
      nextMilestone: 'Legal Review',
      documentsCount: 8
    }
  ];

  const handleViewDocuments = (dealId: string) => {
    navigate(`/deals/${dealId}/documents`);
  };

  const handleCreateDeal = () => {
    // For now, create a demo deal
    const demoId = 'demo-deal-' + Date.now();
    navigate(`/deals/${demoId}/documents`);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Deals</h1>
          <Button onClick={handleCreateDeal}>
            Create New Deal
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockDeals.map((deal) => (
            <Card key={deal.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{deal.title}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    deal.status === 'active' ? 'bg-green-100 text-green-800' :
                    deal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {deal.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Health Score</span>
                  </div>
                  <span className="font-semibold">{deal.healthScore}%</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-600">{deal.nextMilestone}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Documents</span>
                  </div>
                  <span className="font-semibold">{deal.documentsCount}</span>
                </div>
                
                <Button 
                  onClick={() => handleViewDocuments(deal.id)}
                  className="w-full"
                  variant="outline"
                >
                  View Documents
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {mockDeals.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deals yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first deal</p>
            <Button onClick={handleCreateDeal}>
              Create Your First Deal
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DealsPage;
