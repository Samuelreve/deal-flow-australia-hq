
import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTabNotificationIndicator } from "@/hooks/useTabNotificationIndicator";
import DealOverviewTab from "./tabs/DealOverviewTab";
import DealMilestonesTab from "./tabs/DealMilestonesTab";
import DealDocumentsTab from "./tabs/DealDocumentsTab";
import DealParticipantsTab from "./tabs/DealParticipantsTab";
import DealMessagesTab from "./tabs/DealMessagesTab";
import DealTimelineTab from "./tabs/DealTimelineTab";
import DealAIAssistantTab from "./tabs/DealAIAssistantTab";

interface Deal {
  id: string;
  title: string;
  description?: string;
  status: string;
  health_score: number;
  seller_id: string;
  buyer_id?: string;
  asking_price?: number;
  deal_type?: string;
  business_legal_name?: string;
  business_trading_names?: string;
  business_abn?: string;
  business_acn?: string;
  business_industry?: string;
  business_years_in_operation?: number;
  business_registered_address?: string;
  business_principal_place_address?: string;
  reason_for_selling?: string;
  primary_seller_contact_name?: string;
  target_completion_date?: string;
  created_at: string;
  updated_at: string;
}

interface DealDetailsContentProps {
  deal: Deal;
  activeTab: string;
  setActiveTab: (tab: string, participantId?: string) => void;
  dealId: string;
  selectedParticipantId?: string;
}

const DealDetailsContent: React.FC<DealDetailsContentProps> = ({
  deal,
  activeTab,
  setActiveTab,
  dealId,
  selectedParticipantId
}) => {
  const { hasUnreadMessages, markTabAsViewed } = useTabNotificationIndicator(dealId);
  
  // Mark tab as viewed when user switches to messages tab
  useEffect(() => {
    if (activeTab === "messages") {
      markTabAsViewed();
    }
  }, [activeTab, markTabAsViewed]);
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full h-auto p-1 bg-muted/50 rounded-lg border border-border/50 backdrop-blur-sm">
        <div className="flex overflow-x-auto scrollbar-hide lg:overflow-x-visible w-full gap-1">
          <TabsTrigger 
            value="overview" 
            className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 lg:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="milestones" 
            className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 lg:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            Milestones
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 lg:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            Documents
          </TabsTrigger>
          <TabsTrigger 
            value="participants" 
            className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 lg:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            Participants
          </TabsTrigger>
          <TabsTrigger 
            value="messages" 
            className="relative text-xs sm:text-sm whitespace-nowrap flex-shrink-0 lg:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            Messages
            {hasUnreadMessages && activeTab !== "messages" && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="timeline" 
            className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 lg:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            Timeline
          </TabsTrigger>
          <TabsTrigger 
            value="ai-assistant" 
            className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 lg:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            AI Assistant
          </TabsTrigger>
        </div>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <DealOverviewTab deal={deal} />
      </TabsContent>

      <TabsContent value="milestones" className="mt-6">
        <DealMilestonesTab dealId={dealId} />
      </TabsContent>

      <TabsContent value="documents" className="mt-6">
        <DealDocumentsTab dealId={dealId} />
      </TabsContent>

      <TabsContent value="participants" className="mt-6">
        <DealParticipantsTab dealId={dealId} onTabChange={setActiveTab} />
      </TabsContent>

      <TabsContent value="messages" className="mt-6">
        <DealMessagesTab dealId={dealId} selectedParticipantId={selectedParticipantId} />
      </TabsContent>

      <TabsContent value="timeline" className="mt-6">
        <DealTimelineTab dealId={dealId} />
      </TabsContent>

      <TabsContent value="ai-assistant" className="mt-6">
        <DealAIAssistantTab dealId={dealId} deal={deal} />
      </TabsContent>
    </Tabs>
  );
};

export default DealDetailsContent;
