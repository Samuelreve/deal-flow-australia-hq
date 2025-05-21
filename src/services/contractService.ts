
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentUploadService } from "@/hooks/useDocumentUploadService";

/**
 * Creates a temporary deal for contract analysis
 */
export async function createTemporaryDeal(fileName: string, userId: string) {
  const tempDealName = `Contract Analysis: ${fileName}`;
  
  toast.info("Creating temporary deal...", {
    description: "Please wait while we prepare everything for your contract analysis."
  });
  
  // Get auth session for the function call
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  
  // Call the edge function to create a temporary deal
  const { data, error } = await supabase.functions.invoke('create-temp-deal', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    },
    body: {
      title: tempDealName,
      description: 'Auto-generated for contract analysis',
      type: 'analysis'
    },
  });
  
  if (error) {
    console.error("Create temp deal error:", error);
    throw new Error(`Failed to create temporary deal: ${error.message}`);
  }
  
  if (!data || !data.dealId) {
    throw new Error("Failed to receive deal ID from server");
  }
  
  return data.dealId;
}

/**
 * Adds a user as a participant to a deal
 */
export async function addDealParticipant(dealId: string, userId: string) {
  // Get auth session for the function call
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  
  try {
    const { error: participantError } = await supabase.functions.invoke('add-deal-participant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: {
        dealId: dealId,
        userId: userId,
        role: 'admin' // Changed from 'owner' to 'admin' which is a valid role
      }
    });
    
    if (participantError) {
      console.error("Error adding participant:", participantError);
      throw participantError;
    }
  } catch (participantErr) {
    console.error("Failed to add participant:", participantErr);
    throw participantErr;
  }
}

/**
 * Handles the contract upload process, including creating a temporary deal if needed
 */
export async function handleContractUpload(
  file: File, 
  dealId: string | undefined, 
  userId: string,
  uploadDocument: (file: File, dealId: string, category: string) => Promise<any>,
  navigate: ReturnType<typeof useNavigate>
) {
  try {
    if (!dealId) {
      // When on homepage, create a temporary deal first
      const newDealId = await createTemporaryDeal(file.name, userId);
      
      console.log("Created temporary deal:", newDealId);
      
      // Add the current user as a participant to the deal with admin role
      await addDealParticipant(newDealId, userId);
      
      // Upload the document with "contract" category to the new deal
      const result = await uploadDocument(file, newDealId, "contract");
      
      if (result) {
        toast.success("Contract uploaded", {
          description: "Your contract has been uploaded successfully. You can now use the Smart Contract Assistant."
        });
        
        // Navigate to the document view with a flag to open the analyzer
        navigate(`/deals/${newDealId}/documents?analyze=true&docId=${result.document.id}&versionId=${result.version.id}`);
      }
      
      return result;
    } else {
      // If dealId exists, proceed normally
      const result = await uploadDocument(file, dealId, "contract");
      
      if (result) {
        toast.success("Contract uploaded", {
          description: "Your contract has been uploaded successfully. You can now use the Smart Contract Assistant."
        });
        
        // Navigate to the document view with a flag to open the analyzer
        navigate(`/deals/${dealId}/documents?analyze=true&docId=${result.document.id}&versionId=${result.version.id}`);
      }
      
      return result;
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    toast.error("Upload failed", {
      description: error.message || "Failed to upload contract. Please try again later."
    });
    
    return null;
  }
}
