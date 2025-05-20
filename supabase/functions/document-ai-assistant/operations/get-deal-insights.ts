
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { getUserDealRole } from "../../_shared/rbac.ts";
import { formatDate } from "./utils.ts";

function getSupabaseAdmin() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Fetch all deals where the user is a participant along with their milestone and participant information
 */
async function fetchUserDealPortfolio(userId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // First get all deals where user is a participant
    const { data: participantDeals, error: participantError } = await supabaseAdmin
      .from('deal_participants')
      .select('deal_id')
      .eq('user_id', userId);
    
    if (participantError || !participantDeals || participantDeals.length === 0) {
      return { deals: [] };
    }
    
    const dealIds = participantDeals.map(d => d.deal_id);
    
    // Then get full deal data with related milestones and participants
    const { data: deals, error: dealsError } = await supabaseAdmin
      .from('deals')
      .select(`
        id, 
        title,
        business_legal_name,
        status,
        health_score,
        deal_type,
        asking_price,
        created_at,
        target_completion_date,
        updated_at,
        reason_for_selling,
        seller:profiles!seller_id(name),
        buyer:profiles!buyer_id(name),
        milestones(
          id,
          title,
          status,
          due_date,
          completed_at
        )
      `)
      .in('id', dealIds);
      
    if (dealsError) {
      console.error("Error fetching deals:", dealsError);
      return { deals: [] };
    }
    
    // For each deal, get the participants
    const enrichedDeals = await Promise.all(deals.map(async (deal) => {
      const { data: participants } = await supabaseAdmin
        .from('deal_participants')
        .select(`
          role,
          profile:profiles(name)
        `)
        .eq('deal_id', deal.id);
        
      return {
        ...deal,
        participants: participants || []
      };
    }));
    
    return { deals: enrichedDeals };
  } catch (error) {
    console.error("Error fetching user deal portfolio:", error);
    return { deals: [], error: error.message };
  }
}

/**
 * Format deal data for the AI prompt
 */
function formatDealPortfolioForPrompt(deals) {
  if (!deals || deals.length === 0) {
    return "No active deals found in the user's portfolio.";
  }
  
  let formattedData = "";
  
  deals.forEach(deal => {
    // Calculate milestone counts
    const milestoneCounts = {
      completed: 0,
      in_progress: 0,
      blocked: 0,
      not_started: 0
    };
    
    let overdueMilestones = 0;
    const now = new Date();
    
    if (deal.milestones && deal.milestones.length > 0) {
      deal.milestones.forEach(m => {
        milestoneCounts[m.status] = (milestoneCounts[m.status] || 0) + 1;
        
        if (m.status !== 'completed' && m.due_date && new Date(m.due_date) < now) {
          overdueMilestones++;
        }
      });
    }
    
    const totalMilestones = deal.milestones ? deal.milestones.length : 0;
    const milestoneProgress = totalMilestones > 0 
      ? Math.round((milestoneCounts.completed / totalMilestones) * 100) 
      : 0;
    
    // Format participant roles
    const participantRoles = deal.participants 
      ? deal.participants.map(p => p.role).join(', ')
      : 'Unknown';
    
    // Format dates
    const createdDate = formatDate(deal.created_at);
    const targetDate = formatDate(deal.target_completion_date);
    const lastUpdated = formatDate(deal.updated_at);
    
    // Calculate deal age in days
    const ageInDays = Math.round((now.getTime() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    formattedData += `
Deal: ${deal.title} (ID: ${deal.id})
Business: ${deal.business_legal_name || 'Unnamed'}
Status: ${deal.status} (Health Score: ${deal.health_score}%)
Type: ${deal.deal_type || 'Unspecified'} | Asking Price: $${deal.asking_price || 'Unspecified'}
Milestone Progress: ${milestoneCounts.completed}/${totalMilestones} completed (${milestoneProgress}%)
  - Details: Completed: ${milestoneCounts.completed}, In Progress: ${milestoneCounts.in_progress}, 
    Blocked: ${milestoneCounts.blocked}, Not Started: ${milestoneCounts.not_started}, Overdue: ${overdueMilestones}
Participants: ${participantRoles}
Seller: ${deal.seller ? deal.seller.name : 'Unassigned'} 
Buyer: ${deal.buyer ? deal.buyer.name : 'Unassigned'}
Timeline: Created ${createdDate} (${ageInDays} days ago) | Target Completion: ${targetDate} | Last Updated: ${lastUpdated}
---
`;
  });
  
  return formattedData;
}

/**
 * Generate AI insights for a user's deal portfolio
 */
export async function handleGetDealInsights(userId: string, openai: any) {
  try {
    // Fetch the user's deal portfolio
    const { deals, error } = await fetchUserDealPortfolio(userId);
    
    if (error) {
      throw new Error(`Failed to fetch deal portfolio: ${error}`);
    }
    
    if (!deals || deals.length === 0) {
      return {
        insightsText: "You don't have any active deals in your portfolio. Start a new deal to get AI-powered insights.",
        disclaimer: "This is an AI-generated analysis based on your deal portfolio data. It is provided for informational purposes only and should not replace professional judgment."
      };
    }
    
    // Format deal data for the AI prompt
    const formattedDealsData = formatDealPortfolioForPrompt(deals);
    
    // Prepare the OpenAI prompt
    const prompt = `You are an expert business analyst and deal strategist. Your task is to provide high-level strategic insights and actionable recommendations based on the provided deal portfolio data.

Analyze the following deals for trends, potential risks, and opportunities. Identify deals that require immediate attention or are progressing well.

Deal Portfolio Data:
${formattedDealsData}

Provide your insights in the following format:
- **Overall Portfolio Health:** [Brief assessment]
- **Deals Needing Attention:** [List 1-3 deals and why, e.g., low health, overdue milestones, stalled]
- **Deals Progressing Well:** [List 1-2 deals and why]
- **Key Trends/Observations:** [e.g., Common bottlenecks, types of deals performing best]
- **Actionable Recommendations:** [1-3 general recommendations for the user to improve their deal flow]

**Important Rules:**
1. Base your insights and recommendations **ONLY** on the data provided. Do not make up information.
2. Be concise and professional.
3. Do not provide legal or financial advice.
4. If data is insufficient for an insight, state that.
`;

    // Call OpenAI for insights
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using a more efficient model for insights
      messages: [
        {
          role: "system",
          content: "You are an AI business analyst specialized in deal analysis. Provide concise, data-driven insights about the user's deal portfolio."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more factual analysis
      max_tokens: 800  // Adjust based on desired response length
    });

    return {
      insightsText: response.choices[0].message.content,
      disclaimer: "This is an AI-generated analysis based on your deal portfolio data. It is provided for informational purposes only and should not replace professional judgment."
    };
  } catch (error) {
    console.error("Error generating deal insights:", error);
    throw new Error(`Failed to generate deal insights: ${error.message}`);
  }
}
