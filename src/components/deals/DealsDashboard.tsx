
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DealSummary } from "@/types/deal";

interface DealsDashboardProps {
  deals: DealSummary[];
}

const DealsDashboard: React.FC<DealsDashboardProps> = ({ deals }) => {
  const navigate = useNavigate();
  
  // Get appropriate badge color based on deal status
  const getStatusBadgeClass = (status: string) => {
    switch(status.toLowerCase()) {
      case "active":
      case "agreement drafted":
        return "bg-deal-active text-white";
      case "due diligence":
      case "pending":
        return "bg-deal-pending text-white";
      case "nda signed":
      case "completed":
        return "bg-deal-completed text-white";
      default:
        return "bg-deal-draft text-white";
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Your Business Deals</h2>

      {deals.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No active deals found. Start a new deal to see it here!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <Card 
              key={deal.id} 
              className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => navigate(`/deals/${deal.id}`)}
            >
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-primary hover:underline">
                  {deal.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {deal.buyerName ? 
                    `${deal.sellerName} → ${deal.buyerName}` : 
                    `Seller: ${deal.sellerName || 'Unknown'}`}
                </p>

                {/* Deal Status */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-foreground mb-1">Status:</p>
                  <Badge className={getStatusBadgeClass(deal.status)}>
                    {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-foreground mb-1">Progress:</p>
                  <div className="flex items-center gap-2">
                    <Progress value={deal.healthScore} className="h-2 flex-1" />
                    <span className="text-sm">{deal.healthScore}%</span>
                  </div>
                </div>

                {/* Next Action if available */}
                {deal.nextAction && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-1">Next Action:</p>
                    <p className="text-sm text-muted-foreground">{deal.nextAction}</p>
                  </div>
                )}

                {/* Last Updated Info */}
                <p className="text-xs text-muted-foreground mt-2">
                  Last Updated: {new Date(deal.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DealsDashboard;
