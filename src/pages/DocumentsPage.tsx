
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import DocumentManagement from "@/components/deals/DocumentManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Deal } from "@/types/deal";
import { getMockDeal } from "@/data/mockData";

const DocumentsPage = () => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [userDealRole, setUserDealRole] = useState<string>("user");
  const [loading, setLoading] = useState(true);

  // Get the parameters from the query string for document analyzer
  const analyzeModeActive = searchParams.get("analyze") === "true";
  const docIdToAnalyze = searchParams.get("docId");
  const versionIdToAnalyze = searchParams.get("versionId");
  
  useEffect(() => {
    if (!dealId) return;
    
    // In a real app, fetch the deal from the API
    const fetchDeal = async () => {
      setLoading(true);
      try {
        // For demo-deal, always return a valid demo deal
        if (dealId === 'demo-deal') {
          const demoDeal = {
            id: 'demo-deal',
            title: 'Demo Contract Analysis',
            description: 'This is a demo deal for testing contract analysis features',
            status: 'active',
            sellerId: user?.id || 'demo-seller',
            createdAt: new Date(),
            updatedAt: new Date(),
            milestones: [],
            documents: [],
            healthScore: 85,
            comments: [],
            participants: [
              {
                id: 'demo-participant',
                role: 'admin',
                joined: new Date()
              }
            ]
          };
          setDeal(demoDeal);
          setIsParticipant(true);
          setUserDealRole("admin");
          setLoading(false);
          return;
        }
        
        // For non-demo deals, use the regular mock data
        const dealData = getMockDeal(dealId);
        
        if (dealData) {
          setDeal(dealData);
          // Check if user is participant and get their role
          // This is just a mock implementation
          setIsParticipant(true);
          setUserDealRole("seller"); // Mock role, in real app should check from participants
        }
      } catch (error) {
        console.error("Error fetching deal:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeal();
  }, [dealId, user?.id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Loading deal documents...</p>
        </div>
      </AppLayout>
    );
  }

  if (!deal) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-red-500">Deal not found or you don't have permission to access it.</p>
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
          initialDocuments={[]} // Pass initial documents if available
          isParticipant={isParticipant}
        />
      </div>
    </AppLayout>
  );
};

export default DocumentsPage;
