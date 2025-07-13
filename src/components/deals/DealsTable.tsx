
import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { DealSummary } from "@/types/deal";
import { cn } from "@/lib/utils";

interface DealsTableProps {
  deals: DealSummary[];
  totalDeals: number;
}

const DealsTable: React.FC<DealsTableProps> = ({ deals, totalDeals }) => {
  const navigate = useNavigate();
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "pending": return "Pending";
      case "completed": return "Completed";
      case "draft": return "Draft";
      default: return status;
    }
  };
  
  const getStatusClass = (status: string) => {
    return `deal-status-${status}`;
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  };

  if (deals.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No deals found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-4">
        <p className="text-sm text-muted-foreground">
          Showing {deals.length} of {totalDeals} deals
        </p>
      </div>
      
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Deal</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Date</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Health</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right p-4"></th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal, index) => (
              <tr key={deal.id} className={cn("hover:bg-muted/50", index < deals.length - 1 && "border-b")}>
                <td className="p-4">
                  <div>
                    <p className="font-medium">{deal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {deal.buyerName ? `${deal.sellerName} → ${deal.buyerName}` : deal.sellerName}
                    </p>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <div className="flex flex-col">
                    <span className="text-sm">{formatDate(deal.createdAt)}</span>
                    <span className="text-xs text-muted-foreground">Created</span>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <div className="flex items-center gap-2 w-32">
                    <Progress value={deal.healthScore} className="h-2 flex-1" />
                    <span className="text-sm">{deal.healthScore}%</span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge className={cn("deal-status-badge", getStatusClass(deal.status))}>
                    {getStatusText(deal.status)}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/deals/${deal.id}`)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DealsTable;
