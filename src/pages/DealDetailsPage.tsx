
import React, { useState, useEffect } from "react";
import { useParams, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
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

const DealDetailsPage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | undefined>(undefined);

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
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading deal details...</span>
        </div>
      </AppLayout>
    );
  }

  if (!deal) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Deal not found</h2>
          <p className="text-muted-foreground mt-2">The deal you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </AppLayout>
    );
  }

  const handleTabChange = (tab: string, participantId?: string) => {
    setActiveTab(tab);
    if (participantId) {
      setSelectedParticipantId(participantId);
    }
  };

return (
  <AppLayout>
    <div className="container mx-auto px-4 py-6">
      <DealDetailsHeader deal={deal} />
      <DealDetailsContent 
        deal={deal} 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        dealId={dealId!}
        selectedParticipantId={selectedParticipantId}
      />
    </div>
    <CopilotWidget dealId={dealId!} />
  </AppLayout>
);
};

export default DealDetailsPage;
