
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SmartContractPanel from "./SmartContractPanel";

interface Deal {
  id: string;
  title: string;
  business_name?: string;
  status: string;
}

interface DashboardRecentDealsProps {
  deals: Deal[];
}

const DashboardRecentDeals = ({ deals }: DashboardRecentDealsProps) => {
  const navigate = useNavigate();

  const handleDealClick = (deal: Deal) => {
    if (deal.status === 'draft') {
      // Navigate to deal creation page with deal data for editing
      navigate('/create-deal', { state: { editingDeal: deal } });
    } else {
      // Navigate to deal details page for active deals
      navigate(`/deals/${deal.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Recent Deals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Recent Deals</CardTitle>
          <CardDescription>Your latest business opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          {deals.length > 0 ? (
            <div className="space-y-4">
              {deals.slice(0, 5).map((deal) => (
                <div 
                  key={deal.id} 
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors"
                  onClick={() => handleDealClick(deal)}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-2.5 w-2.5 mt-1.5 rounded-full bg-blue-500" />
                    <div>
                      <p className="font-medium">{deal.title}</p>
                      <p className="text-sm text-muted-foreground">{deal.business_name || 'No business name'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={
                      deal.status === 'active' ? 'default' : 
                      deal.status === 'completed' ? 'outline' : 'secondary'
                    }>
                      {deal.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No deals yet</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/create-deal')}
              >
                Create your first deal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Analysis Section - Always show */}
      <SmartContractPanel />
    </div>
  );
};

export default DashboardRecentDeals;
