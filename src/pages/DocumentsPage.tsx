
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import DocumentManagement from "@/components/deals/DocumentManagement";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedLoadingState } from "@/components/common/EnhancedLoadingState";

interface DealData {
  id: string;
  title: string;
  seller_id: string;
  buyer_id: string | null;
}

const DocumentsPage = () => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [deal, setDeal] = useState<DealData | null>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [userDealRole, setUserDealRole] = useState<string>("user");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the parameters from the query string for document analyzer
  const analyzeModeActive = searchParams.get("analyze") === "true";
  const docIdToAnalyze = searchParams.get("docId");
  const versionIdToAnalyze = searchParams.get("versionId");
  
  useEffect(() => {
    if (!dealId || !user?.id) return;
    
    const fetchDealAndParticipation = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch the deal from Supabase
        const { data: dealData, error: dealError } = await supabase
          .from('deals')
          .select('id, title, seller_id, buyer_id')
          .eq('id', dealId)
          .single();
        
        if (dealError) {
          console.error("Error fetching deal:", dealError);
          setError("Deal not found or you don't have permission to access it.");
          return;
        }
        
        if (dealData) {
          setDeal(dealData);
          
          // Check if user is a participant and get their role
          const { data: participantData } = await supabase
            .from('deal_participants')
            .select('role')
            .eq('deal_id', dealId)
            .eq('user_id', user.id)
            .single();
          
          if (participantData) {
            setIsParticipant(true);
            setUserDealRole(participantData.role);
          } else if (dealData.seller_id === user.id) {
            setIsParticipant(true);
            setUserDealRole("seller");
          } else if (dealData.buyer_id === user.id) {
            setIsParticipant(true);
            setUserDealRole("buyer");
          } else {
            setIsParticipant(false);
          }
        }
      } catch (err) {
        console.error("Error fetching deal:", err);
        setError("An error occurred while loading the deal.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDealAndParticipation();
  }, [dealId, user?.id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <EnhancedLoadingState type="cards" message="Loading deal documents..." rows={3} />
        </div>
      </AppLayout>
    );
  }

  if (error || !deal) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-destructive">{error || "Deal not found."}</p>
        </div>
      </AppLayout>
    );
  }

  if (!isParticipant) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-destructive">You don't have permission to access this deal's documents.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Documents for {deal.title}</h1>
        
        {/* Document Management Component */}
        <DocumentManagement
          dealId={dealId || ""}
          userRole={userDealRole}
          initialDocuments={[]}
          isParticipant={isParticipant}
        />
      </div>
    </AppLayout>
  );
};

export default DocumentsPage;
