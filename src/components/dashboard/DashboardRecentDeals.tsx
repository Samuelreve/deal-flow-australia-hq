
import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SmartContractPanel from "./SmartContractPanel";
import { FileText, ChevronRight, Plus } from "lucide-react";

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
      navigate('/create-deal', { state: { editingDeal: deal } });
    } else {
      navigate(`/deals/${deal.id}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-deal-active/15 text-deal-active border-deal-active/20';
      case 'completed':
        return 'bg-deal-completed/15 text-deal-completed border-deal-completed/20';
      case 'pending':
        return 'bg-deal-pending/15 text-deal-pending border-deal-pending/20';
      default:
        return 'bg-deal-draft/15 text-deal-draft border-deal-draft/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Recent Deals Section */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Recent Deals</h3>
                <p className="text-sm text-muted-foreground">Your latest business opportunities</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/deals')}
              className="text-muted-foreground hover:text-foreground"
            >
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="divide-y divide-border/50">
          {deals.length > 0 ? (
            deals.slice(0, 5).map((deal, index) => (
              <div 
                key={deal.id} 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => handleDealClick(deal)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    deal.status === 'active' ? 'bg-deal-active' :
                    deal.status === 'completed' ? 'bg-deal-completed' :
                    deal.status === 'pending' ? 'bg-deal-pending' : 'bg-deal-draft'
                  }`} />
                  <div>
                    <p className="font-medium text-foreground">{deal.title}</p>
                    <p className="text-sm text-muted-foreground">{deal.business_name || 'No business name'}</p>
                  </div>
                </div>
                <Badge className={`border ${getStatusColor(deal.status)}`} variant="outline">
                  {deal.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-12 px-4">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">No deals yet</p>
              <Button 
                onClick={() => navigate('/create-deal')}
                className="btn-premium text-primary-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create your first deal
              </Button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Contract Analysis Section */}
      <SmartContractPanel />
    </div>
  );
};

export default DashboardRecentDeals;
