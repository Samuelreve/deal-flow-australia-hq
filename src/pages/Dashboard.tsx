
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/layout/AppLayout";
import { Plus, ChevronRight } from "lucide-react";
import { DealSummary } from "@/types/deal";
import { getMockDealSummariesForUser } from "@/data/mockData";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<DealSummary[]>([]);
  
  useEffect(() => {
    if (user) {
      // In a real app, this would be an API call
      const userDeals = getMockDealSummariesForUser(user.id, user.role);
      setDeals(userDeals);
    }
  }, [user]);
  
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
  
  return (
    <AppLayout>
      <div className="mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        
        {(user?.role === "seller" || user?.role === "admin") && (
          <Button onClick={() => navigate("/deals/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Deal
          </Button>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all statuses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.filter(d => d.status === "active").length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.filter(d => d.status === "completed").length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully finalized
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require your attention
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="text-lg font-medium mb-4">Your Deals</h2>
        
        {deals.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-muted-foreground">No deals found</p>
                {(user?.role === "seller" || user?.role === "admin") && (
                  <Button className="mt-4" onClick={() => navigate("/deals/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create a new deal
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {deals.map((deal) => (
              <Card key={deal.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-wrap lg:flex-nowrap cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/deals/${deal.id}`)}>
                    <div className="p-4 lg:p-6 flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium">{deal.title}</h3>
                        <Badge className={cn("deal-status-badge", getStatusClass(deal.status))}>
                          {getStatusText(deal.status)}
                        </Badge>
                      </div>
                      
                      {deal.nextMilestone && (
                        <p className="text-sm text-muted-foreground mb-4">
                          Next: <span className="font-medium">{deal.nextMilestone}</span>
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={deal.healthScore} className="h-2 flex-1" />
                        <span className="text-xs font-medium">{deal.healthScore}%</span>
                      </div>
                      
                      {deal.nextAction && (
                        <p className="text-xs text-muted-foreground">
                          Action needed: {deal.nextAction}
                        </p>
                      )}
                    </div>
                    <div className="w-full lg:w-auto flex items-center justify-between border-t lg:border-t-0 lg:border-l border-border p-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-1">
                          {deal.buyerId ? "Buyer" : "No buyer yet"}
                        </span>
                        <span className="text-sm">
                          {deal.buyerName || "-"}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground ml-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
