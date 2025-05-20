
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DealChatAssistantPanel from "./DealChatAssistantPanel";

interface DealChatTabProps {
  dealId: string;
  isParticipant: boolean;
}

const DealChatTab: React.FC<DealChatTabProps> = ({ dealId, isParticipant }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Assistant Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <DealChatAssistantPanel 
          dealId={dealId}
          isParticipant={isParticipant}
        />
      </CardContent>
    </Card>
  );
};

export default DealChatTab;
