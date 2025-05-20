
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Deal } from "@/types/deal";
import { getMockDeal } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { DealParticipant } from "@/components/deals/DealParticipants";

// Imported components
import DealHeader from "@/components/deals/DealHeader";
import DealTabs from "@/components/deals/DealTabs";
import DealSidebar from "@/components/deals/DealSidebar";
import DealMessaging from "@/components/deals/messages/DealMessaging";
import DealHealthPredictionPanel from "@/components/deals/health/DealHealthPredictionPanel";

const DealDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dealParticipants, setDealParticipants] = useState<DealParticipant[]>([]);
  
  // Track if current user is a participant in this deal
  const [isParticipant, setIsParticipant] = useState(false);
  const [currentUserDealRole, setCurrentUserDealRole] = useState<string | null>(null);
  
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
  
  useEffect(() => {
    fetchDeal();
  }, [id]);
  
  // Update participant status whenever dealParticipants or user changes
  useEffect(() => {
    if (user && dealParticipants.length > 0) {
      const userParticipant = dealParticipants.find(p => p.user_id === user.id);
      setIsParticipant(!!userParticipant);
      setCurrentUserDealRole(userParticipant?.role || null);
    } else {
      setIsParticipant(false);
      setCurrentUserDealRole(null);
    }
  }, [user, dealParticipants]);
  
  // Handle participants loaded from DealParticipants component
  const handleParticipantsLoaded = (participants: DealParticipant[]) => {
    setDealParticipants(participants);
  };

  // Handle status update - Refresh deal data
  const handleStatusUpdated = () => {
    fetchDeal();
  };
  
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
  
  // Calculate appropriate user role - use current user's role in the deal if they're a participant,
  // otherwise fallback to their global role or 'viewer' for non-participants
  const effectiveUserRole = currentUserDealRole || (user ? user.role : 'viewer');
  
  return (
    <AppLayout>
      <DealHeader 
        deal={deal} 
        userRole={effectiveUserRole} 
        isParticipant={isParticipant}
        onStatusUpdated={handleStatusUpdated}
      />
      
      {/* Add Deal Health Prediction Panel */}
      {isParticipant && id && (
        <div className="container mx-auto px-4 mb-6">
          <DealHealthPredictionPanel dealId={id} />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <DealTabs 
            deal={deal}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            effectiveUserRole={effectiveUserRole}
            isParticipant={isParticipant}
          />
        </div>
        
        <div>
          <DealSidebar 
            deal={deal} 
            onParticipantsLoaded={handleParticipantsLoaded}
            currentUserDealRole={currentUserDealRole as 'seller' | 'buyer' | 'lawyer' | 'admin' | null}
            isParticipant={isParticipant}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default DealDetails;
