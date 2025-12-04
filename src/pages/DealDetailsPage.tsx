
import React, { useState, useEffect } from "react";
import { useParams, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useParticipantRemovalCheck } from "@/hooks/useParticipantRemovalCheck";
import DealDetailsHeader from "@/components/deal-details/DealDetailsHeader";
import DealDetailsContent from "@/components/deal-details/DealDetailsContent";
import CopilotWidget from "@/components/copilot/CopilotWidget";
import { Loader2 } from "lucide-react";

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
  deal_category?: string;
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
  ip_assets?: any;
  property_details?: any;
  cross_border_details?: any;
  micro_deal_details?: any;
  created_at: string;
  updated_at: string;
}

const DealDetailsPage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | undefined>(undefined);
  const [isParticipant, setIsParticipant] = useState<boolean>(false);

  // Set up real-time participant removal detection
  const { checkParticipantStatus } = useParticipantRemovalCheck({
    dealId: dealId || '',
    enabled: !!dealId && !!user && isParticipant
  });

  useEffect(() => {
    if (dealId && user) {
      fetchDealData();
    }
  }, [dealId, user]);

  // Handle URL parameters for tab switching and signed document notification
  useEffect(() => {
    const tab = searchParams.get('tab');
    const signed = searchParams.get('signed');
    
    if (tab) {
      setActiveTab(tab);
    }
    
    if (signed === 'true') {
      toast({
        title: "Document Signed Successfully",
        description: "The document has been signed and saved to your documents.",
        variant: "default"
      });
    }
  }, [searchParams, toast]);

  const fetchDealData = async () => {
    if (!dealId || !user) return;

    try {
      // First check if user is a participant in the deal
      const { data: participantData, error: participantError } = await supabase
        .from('deal_participants')
        .select('id, role')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .maybeSingle();

      // If there's an error or no participant data, deny access
      if (participantError || !participantData) {
        console.log('Access denied - user not a participant:', { participantError, participantData });
        setIsParticipant(false);
        setLoading(false);
        toast({
          title: "Access Denied",
          description: "You don't have access to this deal or have been removed from it.",
          variant: "destructive"
        });
        // Immediately redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
        return;
      }

      // User is a participant, set flag and continue
      setIsParticipant(true);

      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();

      if (dealError) {
        console.error('Error fetching deal:', dealError);
        toast({
          title: "Error",
          description: "Failed to load deal information",
          variant: "destructive"
        });
        return;
      }

      setDeal(dealData);
    } catch (error) {
      console.error('Error fetching deal data:', error);
      toast({
        title: "Error",
        description: "Failed to load deal data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading deal details...</span>
      </div>
    );
  }

  if (!deal || !isParticipant) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          {!isParticipant 
            ? "You don't have access to this deal or have been removed from it."
            : "The deal you're looking for doesn't exist."
          }
        </p>
      </div>
    );
  }

  const handleTabChange = (tab: string, participantId?: string) => {
    setActiveTab(tab);
    if (participantId) {
      setSelectedParticipantId(participantId);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
      <DealDetailsHeader deal={deal} />
      <DealDetailsContent 
        deal={deal} 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        dealId={dealId!}
        selectedParticipantId={selectedParticipantId}
      />
      <CopilotWidget dealId={dealId!} />
    </div>
  );
};

export default DealDetailsPage;
