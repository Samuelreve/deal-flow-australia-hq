
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DealSummary } from "@/types/deal";
import { ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

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
  
  const getProgressColor = (health: number) => {
    if (health >= 70) return "bg-green-500";
    if (health >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Recent Deals</h2>
        
        {deals.length > 0 && (
          <button 
            onClick={() => navigate('/deals')}
            className="text-sm text-primary hover:underline flex items-center"
          >
            View all deals <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        )}
      </div>

      {deals.length === 0 ? (
        <Card className="border border-dashed bg-muted/40">
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No active deals found. Start a new deal to see it here!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.slice(0, 6).map((deal) => (
            <Card 
              key={deal.id} 
              className="hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border-t-4"
              style={{ borderTopColor: deal.healthScore >= 70 ? '#22c55e' : deal.healthScore >= 40 ? '#f59e0b' : '#ef4444' }}
              onClick={() => navigate(`/deals/${deal.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold mb-1 text-primary hover:underline">
                    {deal.title}
                  </h3>
                  <Badge className={getStatusBadgeClass(deal.status)}>
                    {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {deal.buyerName ? 
                    `${deal.sellerName} → ${deal.buyerName}` : 
                    `Seller: ${deal.sellerName || 'Unknown'}`}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Progress</p>
                    <span className="text-xs font-medium">{deal.healthScore}%</span>
                  </div>
                  <Progress 
                    value={deal.healthScore} 
                    className="h-2" 
                    indicatorClassName={getProgressColor(deal.healthScore)}
                  />
                </div>

                {/* Next Action if available */}
                {deal.nextAction && (
                  <div className="mb-4 bg-muted/30 p-3 rounded-md">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium mb-0.5">Next Action:</p>
                        <p className="text-sm text-muted-foreground">{deal.nextAction}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Last Updated Info */}
                <div className="flex items-center mt-4 text-xs text-muted-foreground">
                  <span>Updated: {formatDate(deal.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DealsDashboard;
