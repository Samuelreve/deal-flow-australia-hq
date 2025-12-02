
import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Filter, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { DealSummary } from "@/types/deal";
import { cn } from "@/lib/utils";

interface DealsTableProps {
  deals: DealSummary[];
  totalDeals: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDeleteDeal: (dealId: string) => void;
  canDelete: boolean;
}

const DealsTable: React.FC<DealsTableProps> = ({ 
  deals, 
  totalDeals, 
  currentPage, 
  totalPages, 
  onPageChange, 
  onDeleteDeal, 
  canDelete 
}) => {
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
      <div className="py-12 text-center">
        <Filter className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="text-base font-medium mb-1">No deals found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="py-2">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * 15 + 1}-{Math.min(currentPage * 15, totalDeals)} of {totalDeals} deals
        </p>
      </div>
      
      <div className="border-t border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 text-sm font-medium text-muted-foreground">Deal</th>
              <th className="text-left py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Date</th>
              <th className="text-left py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Health</th>
              <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right py-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal, index) => (
              <tr 
                key={deal.id} 
                className={cn(
                  "hover:bg-muted/30 transition-colors cursor-pointer",
                  index < deals.length - 1 && "border-b border-border"
                )}
                onClick={() => navigate(`/deals/${deal.id}`)}
              >
                <td className="py-3 pr-4">
                  <div>
                    <p className="font-medium text-foreground">{deal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {deal.buyerName ? `${deal.sellerName} → ${deal.buyerName}` : deal.sellerName}
                    </p>
                  </div>
                </td>
                <td className="py-3 pr-4 hidden md:table-cell">
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground">{formatDate(deal.createdAt)}</span>
                    <span className="text-xs text-muted-foreground">Created</span>
                  </div>
                </td>
                <td className="py-3 pr-4 hidden md:table-cell">
                  <div className="flex items-center gap-2 w-28">
                    <Progress value={deal.healthScore} className="h-1.5 flex-1" />
                    <span className="text-sm text-foreground">{deal.healthScore}%</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <Badge className={cn("deal-status-badge", getStatusClass(deal.status))}>
                    {getStatusText(deal.status)}
                  </Badge>
                </td>
                <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1 justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 text-sm"
                      onClick={() => navigate(`/deals/${deal.id}`)}
                    >
                      View
                    </Button>
                    {canDelete && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onDeleteDeal(deal.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  className="w-8 h-8 p-0"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </>
  );
};

export default DealsTable;
