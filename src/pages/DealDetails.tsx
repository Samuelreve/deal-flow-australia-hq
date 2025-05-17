import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, MessageSquare, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Deal } from "@/types/deal";
import { getMockDeal } from "@/data/mockData";

// Imported components
import DealHeader from "@/components/deals/DealHeader";
import DealProgress from "@/components/deals/DealProgress";
import DealTimeline from "@/components/deals/DealTimeline";
import DealParticipants from "@/components/deals/DealParticipants";
import DealHealth from "@/components/deals/DealHealth";
import DocumentManagement from "@/components/deals/DocumentManagement";
import MilestoneTracker from "@/components/deals/MilestoneTracker";
import DealComments from "@/components/deals/DealComments";

const DealDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    const fetchDeal = () => {
      // In a real app, this would be an API call
      if (id) {
        const dealData = getMockDeal(id);
        if (dealData) {
          setDeal(dealData);
        }
      }
      setLoading(false);
    };
    
    fetchDeal();
  }, [id]);
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading deal information...</p>
        </div>
      </AppLayout>
    );
  }
  
  if (!deal) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Deal Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The deal you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate("/deals")}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Deals
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <DealHeader deal={deal} />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Deal Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <DealProgress milestones={deal.milestones} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentManagement
                    dealId={deal.id}
                    initialDocuments={deal.documents}
                    userRole="admin"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="milestones">
              <Card>
                <CardHeader>
                  <CardTitle>Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <MilestoneTracker
                    dealId={deal.id}
                    userRole="admin"
                    initialMilestones={deal.milestones}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <DealTimeline deal={deal} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <DealComments dealId={deal.id} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                    <p className="text-muted-foreground mb-4">Send messages to other participants in this deal</p>
                    <Button>New Message</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Deal Health</CardTitle>
            </CardHeader>
            <CardContent>
              <DealHealth healthScore={deal.healthScore} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <DealParticipants deal={deal} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DealDetails;
