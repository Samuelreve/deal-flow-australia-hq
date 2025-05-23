import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, AlertTriangle, Search, Filter } from "lucide-react";
import { useDeals } from "@/hooks/useDeals";
import { Deal } from "@/services/dealsService";
import { useNavigate } from "react-router-dom";
import HealthAlertsList from "@/components/deals/health/HealthAlertsList";

interface DealHealthItem extends Deal {
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
      riskLevel: deal.health_score >= 75 ? 'low' : deal.health_score >= 50 ? 'medium' : 'high',
      healthTrend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable' // Mock trend
    }));
  }, [deals]);

  // Filter and sort deals
  const filteredAndSortedDeals = useMemo(() => {
    let filtered = healthDeals.filter(deal => {
      const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           deal.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = filterRisk === 'all' || deal.riskLevel === filterRisk;
      return matchesSearch && matchesRisk;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'health':
          return a.health_score - b.health_score; // Show worst health first
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
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
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Health Alerts</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Deal Health Overview
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
                              {deal.business_name && (
                                <span className="text-sm text-muted-foreground">
                                  ({deal.business_name})
                                </span>
                              )}
                              <Badge variant={getHealthBadgeVariant(deal.riskLevel || 'medium')}>
                                {deal.riskLevel?.toUpperCase()} RISK
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Status: {deal.status}</span>
                              <span>Updated: {new Date(deal.updated_at).toLocaleDateString()}</span>
                              {deal.seller?.name && <span>Seller: {deal.seller.name}</span>}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${getHealthColor(deal.health_score)}`}>
                                {deal.health_score}%
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
        </TabsContent>
        
        <TabsContent value="alerts">
          <HealthAlertsList showMarkAllRead={true} />
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Health Trends</CardTitle>
              <CardDescription>
                Coming soon: Historical health score trends and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <p>Health trends and analytics will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DealHealthDashboard;
