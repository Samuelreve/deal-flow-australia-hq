
import { Link } from "react-router-dom";
import { Deal } from "@/types/deal";
import DocumentManagement from "./DocumentManagement";
import DealMessaging from "./messages/DealMessaging";
import DealTimeline from "./DealTimeline";
import DealParticipants from "./DealParticipants";
import MilestoneTracker from "./milestones/MilestoneTracker";
import DealHealthPredictionPanel from "./health/DealHealthPredictionPanel";

interface DealTabsProps {
  deal: Deal;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  effectiveUserRole: string;
  isParticipant: boolean;
}

const DealTabs = ({ 
  deal, 
  activeTab, 
  setActiveTab,
  effectiveUserRole,
  isParticipant
}: DealTabsProps) => {
  // Define tabs available to all users
  const commonTabs = [
    { id: "overview", label: "Overview" },
    { id: "documents", label: "Documents" },
    { id: "messages", label: "Messages" },
    { id: "timeline", label: "Timeline" }
  ];
  
  // Define tabs only available to participants
  const participantOnlyTabs = [
    { id: "milestones", label: "Milestones" },
    { id: "participants", label: "Participants" }
  ];
  
  // Combine tabs based on user participation
  const availableTabs = isParticipant 
    ? [...commonTabs, ...participantOnlyTabs]
    : commonTabs;

  return (
    <div className="mb-6">
      <div className="border-b">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {availableTabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.id === "documents" ? `/deals/${deal.id}/documents` : "#"}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
              `}
              onClick={(e) => {
                if (tab.id !== "documents") {
                  e.preventDefault();
                  setActiveTab(tab.id);
                }
              }}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="py-4">
        {activeTab === "overview" && (
          <div>
            <h3 className="text-lg font-semibold">Deal Overview</h3>
            <p>A summary of the deal's key information and status.</p>
          </div>
        )}
        
        {activeTab === "documents" && (
          <div>
            {/* The DocumentManagement component is now rendered in the DocumentsPage */}
          </div>
        )}
        
        {activeTab === "messages" && (
          <DealMessaging dealId={deal.id} isParticipant={isParticipant} />
        )}
        
        {activeTab === "timeline" && (
          <DealTimeline deal={deal} />
        )}
        
        {activeTab === "milestones" && isParticipant && (
          <MilestoneTracker dealId={deal.id} userRole={effectiveUserRole} />
        )}
        
        {activeTab === "participants" && isParticipant && (
          <DealParticipants deal={deal} />
        )}
      </div>
    </div>
  );
};

export default DealTabs;
