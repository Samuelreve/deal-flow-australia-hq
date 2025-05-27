
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import DocumentManagement from "@/components/deals/DocumentManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Deal } from "@/types/deal";
import { getMockDeal } from "@/data/mockData";
import { toast } from "sonner";

const DocumentsPage = () => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [userDealRole, setUserDealRole] = useState<string>("user");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the parameters from the query string for document analyzer
  const analyzeModeActive = searchParams.get("analyze") === "true";
  const docIdToAnalyze = searchParams.get("docId");
  const versionIdToAnalyze = searchParams.get("versionId");
  
  useEffect(() => {
    if (!dealId) {
      setError("Deal ID is required");
      setLoading(false);
      return;
    }
    
    const fetchDeal = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching deal with ID:", dealId);
        
        // Simulate fetching the deal
        const dealData = getMockDeal(dealId);
        
        if (dealData) {
          console.log("Deal found:", dealData);
          setDeal(dealData);
          // Check if user is participant and get their role
          setIsParticipant(true);
          setUserDealRole("seller"); // Mock role, in real app should check from participants
          
          toast.success(`Loaded deal: ${dealData.title}`);
        } else {
          console.log("Deal not found for ID:", dealId);
          setError("Deal not found or you don't have permission to access it.");
        }
      } catch (error) {
        console.error("Error fetching deal:", error);
        setError("Failed to load deal information");
        toast.error("Failed to load deal");
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
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-500">Loading deal documents...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !deal) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-gray-500">Please check the deal ID and try again.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Documents for {deal.title}</h1>
          <p className="text-muted-foreground mt-1">
            Manage and analyze documents for this deal
          </p>
          
          {analyzeModeActive && docIdToAnalyze && (
            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-700">
                Analysis mode is active for document ID: {docIdToAnalyze}
              </p>
            </div>
          )}
        </div>
        
        {/* Document Management Component */}
        <DocumentManagement
          dealId={dealId || ""}
          userRole={userDealRole}
          initialDocuments={[]} // Pass initial documents if available
          isParticipant={isParticipant}
          dealTitle={deal.title}
        />
      </div>
    </AppLayout>
  );
};

export default DocumentsPage;
