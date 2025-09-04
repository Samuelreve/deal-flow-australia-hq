
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
      <TabsList className="w-full h-8 sm:h-10 md:h-12 lg:h-14 p-0.5 sm:p-1 md:p-1.5 bg-muted rounded-md">
        <div className="flex overflow-x-auto scrollbar-hide md:overflow-x-visible w-full h-full">
          <TabsTrigger value="overview" className="text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap flex-shrink-0 md:flex-1 px-1.5 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-3 h-full">Overview</TabsTrigger>
          <TabsTrigger value="milestones" className="text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap flex-shrink-0 md:flex-1 px-1.5 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-3 h-full">Milestones</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap flex-shrink-0 md:flex-1 px-1.5 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-3 h-full">Documents</TabsTrigger>
          <TabsTrigger value="participants" className="text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap flex-shrink-0 md:flex-1 px-1.5 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-3 h-full">Participants</TabsTrigger>
          <TabsTrigger value="messages" className="relative text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap flex-shrink-0 md:flex-1 px-1.5 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-3 h-full">
            Messages
            {hasUnreadMessages && activeTab !== "messages" && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-destructive rounded-full"></div>
            )}
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap flex-shrink-0 md:flex-1 px-1.5 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-3 h-full">Timeline</TabsTrigger>
          <TabsTrigger value="ai-assistant" className="text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap flex-shrink-0 md:flex-1 px-1.5 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-3 h-full">AI Assistant</TabsTrigger>
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
