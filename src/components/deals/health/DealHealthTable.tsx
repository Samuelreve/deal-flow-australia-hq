
import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DealSummary } from "@/types/deal";
import { formatDistanceToNow } from "date-fns";
import DealHealth from "@/components/deals/DealHealth";

interface DealHealthTableProps {
  deals: DealSummary[];
  healthFilterValue: number | null;
  riskFilter: 'all' | 'high' | 'medium' | 'low';
  sortOrder: 'asc' | 'desc';
  onSelectDeal: (dealId: string) => void;
}

const DealHealthTable: React.FC<DealHealthTableProps> = ({
  deals,
  healthFilterValue,
  riskFilter,
  sortOrder,
  onSelectDeal
}) => {
  // Filter and sort deals
  const filteredAndSortedDeals = useMemo(() => {
    // Start with active deals only
    let filtered = deals.filter(deal => deal.status === 'active');
    
    // Apply health score filter
    if (healthFilterValue && healthFilterValue > 0) {
      filtered = filtered.filter(deal => deal.healthScore >= healthFilterValue);
    }
    
    // Apply risk level filter
    if (riskFilter !== 'all') {
      filtered = filtered.filter(deal => {
        const score = deal.healthScore;
        if (riskFilter === 'high') return score < 50;
        if (riskFilter === 'medium') return score >= 50 && score < 75;
        if (riskFilter === 'low') return score >= 75;
        return true;
      });
    }
    
    // Sort by health score
    return filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.healthScore - b.healthScore;
      } else {
        return b.healthScore - a.healthScore;
      }
    });
  }, [deals, healthFilterValue, riskFilter, sortOrder]);
  
  // Get risk level badge for a deal
  const getRiskBadge = (score: number) => {
    if (score < 50) {
      return <Badge variant="destructive">High Risk</Badge>;
    } else if (score < 75) {
      return <Badge variant="default">Medium Risk</Badge>;
    } else {
      return <Badge variant="secondary">Low Risk</Badge>;
    }
  };
  
  // Mock trend data (would be replaced with real data)
  const getTrendIcon = (dealId: string) => {
    // This would be replaced with real trend data
    const mock = dealId.charCodeAt(0) % 3;
    if (mock === 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (mock === 1) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };
  
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deal Name</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Health Score</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Trend</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedDeals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No deals match the selected criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedDeals.map(deal => (
                <TableRow 
                  key={deal.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectDeal(deal.id)}
                >
                  <TableCell className="font-medium">{deal.title}</TableCell>
                  <TableCell>{deal.businessName || "—"}</TableCell>
                  <TableCell>
                    <DealHealth 
                      healthScore={deal.healthScore} 
                      showLabel={false} 
                      size="sm" 
                    />
                  </TableCell>
                  <TableCell>{getRiskBadge(deal.healthScore)}</TableCell>
                  <TableCell>{getTrendIcon(deal.id)}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(deal.updatedAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DealHealthTable;
