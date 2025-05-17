
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import DealProgress from "@/components/deals/DealProgress";
import DealTimeline from "@/components/deals/DealTimeline";
import DocumentManagement from "@/components/deals/DocumentManagement";
import MilestoneTracker from "@/components/deals/MilestoneTracker";
import DealComments from "@/components/deals/DealComments";
import { Deal } from "@/types/deal";

interface DealTabsProps {
  deal: Deal;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  effectiveUserRole: string;
  isParticipant: boolean;
}

const DealTabs: React.FC<DealTabsProps> = ({ 
  deal, 
  activeTab, 
  setActiveTab, 
  effectiveUserRole,
  isParticipant 
}) => {
  return (
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
              userRole={effectiveUserRole}
              isParticipant={isParticipant}
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
              userRole={effectiveUserRole}
              initialMilestones={deal.milestones}
              isParticipant={isParticipant}
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
            <DealComments dealId={deal.id} userRole={effectiveUserRole} isParticipant={isParticipant} />
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
              {isParticipant && (
                <Button>New Message</Button>
              )}
              {!isParticipant && (
                <p className="text-sm text-amber-600">You need to be a participant in this deal to send messages.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default DealTabs;
