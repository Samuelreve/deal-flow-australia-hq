
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, AlertTriangle, Search, Filter } from "lucide-react";
import { useDeals } from "@/hooks/useDeals";
import { DealSummary } from "@/types/deal";
import { useNavigate } from "react-router-dom";

interface DealHealthItem extends DealSummary {
  healthTrend?: 'up' | 'down' | 'stable';
  riskLevel?: 'low' | 'medium' | 'high';
}

const DealHealthDashboard = () => {
  const { deals, loading } = useDeals();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'health' | 'title' | 'date'>('health');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Transform deals with health analysis
  const healthDeals: DealHealthItem[] = useMemo(() => {
    return deals.map(deal => ({
      ...deal,
      riskLevel: deal.healthScore >= 75 ? 'low' : deal.healthScore >= 50 ? 'medium' : 'high',
      healthTrend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable' // Mock trend
    }));
  }, [deals]);

  // Filter and sort deals
  const filteredAndSortedDeals = useMemo(() => {
    let filtered = healthDeals.filter(deal => {
      const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           deal.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = filterRisk === 'all' || deal.riskLevel === filterRisk;
      return matchesSearch && matchesRisk;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'health':
          return a.healthScore - b.healthScore; // Show worst health first
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });
  }, [healthDeals, searchTerm, sortBy, filterRisk]);

  const getHealthColor = (score: number): string => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthBadgeVariant = (riskLevel: string): "default" | "outline" | "secondary" | "destructive" => {
    switch (riskLevel) {
      case 'high': return "destructive";
      case 'medium': return "default";
      case 'low': return "secondary";
      default: return "outline";
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4" />; // Stable - no icon
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deal Health Dashboard</CardTitle>
          <CardDescription>Loading deal health information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Deal Health Dashboard
        </CardTitle>
        <CardDescription>
          Monitor and analyze the health of all your deals
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="health">Health Score</SelectItem>
              <SelectItem value="title">Deal Title</SelectItem>
              <SelectItem value="date">Last Updated</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterRisk} onValueChange={(value: any) => setFilterRisk(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Deal Health List */}
        <div className="space-y-4">
          {filteredAndSortedDeals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deals found matching your criteria
            </div>
          ) : (
            filteredAndSortedDeals.map((deal) => (
              <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/deals/${deal.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{deal.title}</h3>
                        {deal.businessName && (
                          <span className="text-sm text-muted-foreground">
                            ({deal.businessName})
                          </span>
                        )}
                        <Badge variant={getHealthBadgeVariant(deal.riskLevel || 'medium')}>
                          {deal.riskLevel?.toUpperCase()} RISK
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Status: {deal.status}</span>
                        <span>Updated: {deal.updatedAt.toLocaleDateString()}</span>
                        {deal.sellerName && <span>Seller: {deal.sellerName}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getHealthColor(deal.healthScore)}`}>
                          {deal.healthScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">Health Score</div>
                      </div>
                      
                      <div className="flex items-center">
                        {getTrendIcon(deal.healthTrend)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DealHealthDashboard;
