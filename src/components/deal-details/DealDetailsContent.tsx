
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  setActiveTab: (tab: string) => void;
  dealId: string;
}

const DealDetailsContent: React.FC<DealDetailsContentProps> = ({
  deal,
  activeTab,
  setActiveTab,
  dealId
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="milestones">Milestones</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="participants">Participants</TabsTrigger>
        <TabsTrigger value="messages">Messages</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
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
        <DealParticipantsTab dealId={dealId} />
      </TabsContent>

      <TabsContent value="messages" className="mt-6">
        <DealMessagesTab dealId={dealId} />
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
