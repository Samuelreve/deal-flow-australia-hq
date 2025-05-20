
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { fetchDealData } from "./deal-data.ts";
import { formatDate } from "./utils.ts";

/**
 * Generates a concise summary of a deal using AI
 */
export async function handleSummarizeDeal(dealId: string, openai: any) {
  try {
    // Fetch comprehensive deal data
    const dealData = await fetchDealData(dealId);
    
    if (!dealData || !dealData.deal) {
      throw new Error("Deal not found");
    }
    
    const deal = dealData.deal;
    const participants = dealData.participants || {};
    
    // Format the deal data for the AI prompt
    const formattedDealData = formatDealDataForPrompt(deal, participants);
    
    // Call OpenAI for summarization
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using a more efficient model for summarization
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in business deal summarization. Provide concise, focused summaries of business deals highlighting key details, status, participants, and next steps in a professional manner."
        },
        {
          role: "user",
          content: `Generate a concise summary of the following business deal. Focus on the deal's current status, key parties, milestones, and next steps. Provide the summary as 3-5 key bullet points that highlight the most important information a participant would need to know.\n\nDeal Details:\n${formattedDealData}`
        }
      ],
      temperature: 0.3, // Lower temperature for more factual summaries
      max_tokens: 400  // Adjust based on desired summary length
    });

    return {
      summary: response.choices[0].message.content,
      disclaimer: "This summary is AI-generated and provided for convenience only. Always review complete deal details for critical decisions."
    };
  } catch (error) {
    console.error("Error summarizing deal:", error);
    throw new Error(`Failed to generate deal summary: ${error.message}`);
  }
}

/**
 * Format deal data into a text representation for the AI prompt
 */
function formatDealDataForPrompt(deal: any, participants: Record<string, any[]>) {
  // Build basic deal information
  let dealText = `Deal Name: ${deal.title} (ID: ${deal.id})
Business: ${deal.business_legal_name || 'N/A'} ${deal.description ? `- ${deal.description}` : ''}
Deal Type: ${deal.deal_type || 'Business Acquisition'}
Current Status: ${deal.status} (Health Score: ${deal.health_score}%)
Asking Price: ${formatCurrency(deal.asking_price)}
${deal.reason_for_selling ? `Reason for Selling: ${deal.reason_for_selling}\n` : ''}
${deal.target_completion_date ? `Target Completion: ${formatDate(deal.target_completion_date)}\n` : ''}

`;

  // Add participants information
  dealText += 'Participants:\n';
  
  // Format sellers
  if (participants.seller && participants.seller.length > 0) {
    dealText += `- Seller: ${participants.seller.map(p => p.name).join(', ')}\n`;
  } else {
    dealText += `- Seller: Unknown\n`;
  }
  
  // Format buyers
  if (participants.buyer && participants.buyer.length > 0) {
    dealText += `- Buyer: ${participants.buyer.map(p => p.name).join(', ')}\n`;
  } else {
    dealText += `- Buyer: Not assigned yet\n`;
  }
  
  // Format lawyers if any
  if (participants.lawyer && participants.lawyer.length > 0) {
    dealText += `- Lawyer(s): ${participants.lawyer.map(p => p.name).join(', ')}\n`;
  }
  
  // Add milestones if available
  if (deal.milestones && deal.milestones.length > 0) {
    dealText += `\nMilestone Progress:\n`;
    
    deal.milestones.forEach((milestone: any) => {
      let milestoneText = `- ${milestone.title}: ${formatMilestoneStatus(milestone.status)}`;
      
      if (milestone.due_date) {
        milestoneText += ` (Due: ${formatDate(milestone.due_date)})`;
      }
      
      dealText += milestoneText + '\n';
    });
  }
  
  return dealText;
}

/**
 * Format milestone status for better readability
 */
function formatMilestoneStatus(status: string): string {
  switch (status) {
    case 'not_started':
      return 'Not Started';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'blocked':
      return 'Blocked';
    default:
      return status;
  }
}

/**
 * Format currency value with dollar sign
 */
function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Not specified';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
