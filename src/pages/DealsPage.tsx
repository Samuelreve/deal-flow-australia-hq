
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DealSummary, DealStatus } from "@/types/deal";
import { getMockDealSummariesForUser } from "@/data/mockData";
import { cn } from "@/lib/utils";

const DealsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<DealSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DealStatus | "all">("all");
  
  useEffect(() => {
    if (user) {
      // In a real app, this would be an API call
      const userDeals = getMockDealSummariesForUser(user.id, user.role);
      setDeals(userDeals);
      setFilteredDeals(userDeals);
    }
  }, [user]);
  
  useEffect(() => {
    let filtered = deals;
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(deal => deal.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.title.toLowerCase().includes(term) ||
        (deal.sellerName && deal.sellerName.toLowerCase().includes(term)) ||
        (deal.buyerName && deal.buyerName.toLowerCase().includes(term))
      );
    }
    
    setFilteredDeals(filtered);
  }, [searchTerm, statusFilter, deals]);
  
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
  
  return (
    <AppLayout>
      <div className="mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Deals</h1>
          <p className="text-muted-foreground">Manage all your business transactions</p>
        </div>
        
        {(user?.role === "seller" || user?.role === "admin") && (
          <Button onClick={() => navigate("/create-deal")}>
            <Plus className="h-4 w-4 mr-2" />
            New Deal
          </Button>
        )}
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-0">
          <CardTitle>Find Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-40">
              <Select 
                value={statusFilter} 
                onValueChange={(value) => setStatusFilter(value as DealStatus | "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {filteredDeals.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No deals found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Create a new deal to get started"}
                </p>
                {(user?.role === "seller" || user?.role === "admin") && !searchTerm && statusFilter === "all" && (
                  <Button onClick={() => navigate("/create-deal")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Deal
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between px-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredDeals.length} of {deals.length} deals
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
                  {filteredDeals.map((deal, index) => (
                    <tr key={deal.id} className={cn("hover:bg-muted/50", index < filteredDeals.length - 1 && "border-b")}>
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
        )}
      </div>
    </AppLayout>
  );
};

export default DealsPage;
