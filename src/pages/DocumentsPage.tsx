
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import DocumentManagement from "@/components/deals/DocumentManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Deal, DealStatus } from "@/types/deal";
import { getMockDeal } from "@/data/mockData";

const DocumentsPage = () => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [userDealRole, setUserDealRole] = useState<string>("user");
  const [loading, setLoading] = useState(true);

  // Get the parameters from the query string for document analyzer
  const analyzeModeActive = searchParams.get("analyze") === "true";
  const docIdToAnalyze = searchParams.get("docId");
  const versionIdToAnalyze = searchParams.get("versionId");
  
  useEffect(() => {
    if (!dealId) {
      setLoading(false);
      return;
    }
    
    // Special handling for demo deal
    if (dealId === "demo-deal") {
      // Create a mock deal for demo purposes
      const demoDeal: Deal = {
        id: "demo-deal",
        title: "Demo Contract Analysis",
        description: "This is a demonstration of our contract analysis features.",
        status: "active" as DealStatus, // Explicitly type as DealStatus
        sellerId: user?.id || "demo-user",
        createdAt: new Date(),
        updatedAt: new Date(),
        milestones: [],
        documents: [],
        healthScore: 85,
        comments: [],
        participants: [
          {
            id: "demo-participant",
            userId: user?.id || "demo-user",
            dealId: "demo-deal",
            role: "admin",
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      };
      
      setDeal(demoDeal);
      setIsParticipant(true);
      setUserDealRole("admin"); // Demo users are admins to see all features
      setLoading(false);
      return;
    }
    
    // For non-demo deals, fetch from API
    const fetchDeal = async () => {
      setLoading(true);
      try {
        // Simulate fetching the deal
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

  // Redirect to login if not authenticated and trying to access demo
  useEffect(() => {
    if (!isAuthenticated && dealId === "demo-deal") {
      navigate('/login?redirect=/deals/demo-deal/documents');
    }
  }, [isAuthenticated, dealId, navigate]);

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
        <h1 className="text-2xl font-bold mb-6">
          {dealId === "demo-deal" ? "Smart Contract Assistant (Preview Mode)" : `Documents for ${deal.title}`}
        </h1>
        
        {/* Document Management Component */}
        <DocumentManagement
          dealId={dealId || ""}
          userRole={userDealRole}
          initialDocuments={[]} // Pass initial documents if available
          isParticipant={isParticipant}
          isDemoMode={dealId === "demo-deal"}
        />
        
        {/* Disclaimer for demo mode */}
        {dealId === "demo-deal" && (
          <div className="mt-8 p-4 border border-amber-200 bg-amber-50 rounded-md">
            <p className="text-amber-800 text-sm">
              This is a demonstration of DealPilot's Smart Contract Assistant. 
              The information here is not legal advice. Please consult a legal professional for binding advice.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DocumentsPage;
