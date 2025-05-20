
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { DealHealthPredictionResponse } from "../types.ts";

function getSupabaseAdmin() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Create a formatted context string from deal data
 */
function formatDealContextForPrediction(dealData: any, milestonesData: any[], participantsData: any[], documentsData: any[], messagesData: any[] = []) {
  const totalMilestones = milestonesData.length;
  const completedMilestones = milestonesData.filter(m => m.status === 'completed').length;
  const blockedMilestones = milestonesData.filter(m => m.status === 'blocked').length;
  const overdueMilestones = milestonesData.filter(m => {
    return m.status !== 'completed' && 
           m.due_date && 
           new Date(m.due_date) < new Date();
  }).length;
  
  const dealAgeDays = Math.floor(
    (new Date().getTime() - new Date(dealData.created_at).getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  
  // Get the latest activity date from milestones or the deal itself
  const milestoneActivityDates = milestonesData.map(m => 
    new Date(m.completed_at || m.updated_at || m.created_at).getTime()
  );
  const lastActivityDate = new Date(
    Math.max(...milestoneActivityDates, new Date(dealData.updated_at).getTime())
  );
  
  let formattedContext = `Current Deal Status and Progress for Deal: ${dealData.title || 'Untitled'} (ID: ${dealData.id})\n`;
  formattedContext += `Business: ${dealData.business_legal_name || 'Not specified'}\n`;
  formattedContext += `Deal Type: ${dealData.deal_type || 'Not specified'}\n`;
  formattedContext += `Current Overall Status: ${dealData.status} (Health Score: ${dealData.health_score}%)\n`;
  formattedContext += `Deal Age: ${dealAgeDays} days\n`;
  
  if (dealData.asking_price) {
    formattedContext += `Asking Price: $${dealData.asking_price}\n`;
  }
  
  if (dealData.reason_for_selling) {
    formattedContext += `Reason for Selling: ${dealData.reason_for_selling}\n`;
  }
  
  formattedContext += `Last Activity: ${lastActivityDate.toISOString().split('T')[0]}\n\n`;
  
  formattedContext += `Milestone Breakdown (${completedMilestones}/${totalMilestones} completed, ${overdueMilestones} overdue, ${blockedMilestones} blocked):\n`;
  milestonesData.forEach(m => {
    formattedContext += `- ${m.title}: ${m.status}`;
    if (m.due_date) {
      formattedContext += ` (Due: ${new Date(m.due_date).toISOString().split('T')[0]})`;
    }
    if (m.completed_at) {
      formattedContext += ` (Completed: ${new Date(m.completed_at).toISOString().split('T')[0]})`;
    }
    formattedContext += '\n';
    
    if (m.description) {
      formattedContext += `  Description: ${m.description}\n`;
    }
  });
  formattedContext += `\n`;
  
  // Add participant information
  formattedContext += `Participants:\n`;
  participantsData.forEach(p => {
    const name = p.profiles?.name || 'Unknown';
    formattedContext += `- ${name} (${p.role})\n`;
  });
  formattedContext += `\n`;
  
  // Add document information
  if (documentsData.length > 0) {
    formattedContext += `Documents (${documentsData.length} total):\n`;
    const documentsByStatus = documentsData.reduce((acc, doc) => {
      if (!acc[doc.status]) acc[doc.status] = 0;
      acc[doc.status]++;
      return acc;
    }, {});
    
    Object.entries(documentsByStatus).forEach(([status, count]) => {
      formattedContext += `- ${count} ${status} documents\n`;
    });
    
    // Recent documents (limit to 5)
    const recentDocs = documentsData
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
      
    formattedContext += `Most recent documents:\n`;
    recentDocs.forEach(doc => {
      formattedContext += `- "${doc.name}" (${doc.status}, ${new Date(doc.created_at).toISOString().split('T')[0]})\n`;
    });
  } else {
    formattedContext += `No documents uploaded yet.\n`;
  }
  formattedContext += `\n`;
  
  // Add message information if available
  if (messagesData.length > 0) {
    formattedContext += `Communication Activity:\n`;
    formattedContext += `- ${messagesData.length} total messages\n`;
    formattedContext += `- Last message: ${new Date(messagesData[0].created_at).toISOString().split('T')[0]}\n`;
    formattedContext += `- Participant engagement: ${new Set(messagesData.map(m => m.user_id)).size} participants active\n`;
  } else {
    formattedContext += `No communication activity recorded.\n`;
  }
  
  return formattedContext;
}

/**
 * Build the prompt for the OpenAI API to predict deal health
 */
function buildDealPredictionPrompt(formattedContext: string): string {
  return `You are an expert business deal strategist and risk analyst. Your task is to analyze the provided deal data, predict its probability of success, and suggest actionable improvements to increase that probability or accelerate the deal.

Deal Context:
${formattedContext}

Provide your analysis in the following structured JSON format:
{
  "probability_of_success_percentage": [Integer from 0-100],
  "confidence_level": "[High|Medium|Low]",
  "prediction_reasoning": "[Brief explanation of why this prediction]",
  "suggested_improvements": [
    { "area": "[e.g., Milestones, Documents, Communication, Participants]", "recommendation": "[Specific actionable step]", "impact": "[High|Medium|Low]" },
    { "area": "...", "recommendation": "...", "impact": "..." }
  ],
  "disclaimer": "This is an AI-generated prediction based on available data and should not be taken as professional advice or a guarantee."
}

**Important Rules:**
1. Base your prediction and suggestions **ONLY** on the 'Deal Context' provided. Do not make up information.
2. The 'probability_of_success_percentage' must be an integer between 0 and 100.
3. Recommendations should be specific, actionable steps related to the deal's current state.
4. Do NOT provide legal or financial advice.
5. If data is insufficient for a strong prediction, state that in 'prediction_reasoning' and use 'Low' confidence.
6. Provide 3-5 suggestions for improvement, focused on the most impactful actions.
`;
}

/**
 * Handle the predict_deal_health operation
 */
export async function handlePredictDealHealth(dealId: string, userId: string, openai: any): Promise<DealHealthPredictionResponse> {
  console.log(`Processing deal health prediction for deal ${dealId}`);
  
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Fetch all necessary data for the deal
    // 1. Fetch the deal data
    const { data: dealData, error: dealError } = await supabaseAdmin
      .from('deals')
      .select(`
        *,
        seller:seller_id(name),
        buyer:buyer_id(name)
      `)
      .eq('id', dealId)
      .single();
      
    if (dealError) {
      console.error("Error fetching deal data:", dealError);
      throw new Error(`Error fetching deal data: ${dealError.message}`);
    }
    
    if (!dealData) {
      throw new Error("Deal not found");
    }
    
    // 2. Fetch milestone data
    const { data: milestonesData, error: milestonesError } = await supabaseAdmin
      .from('milestones')
      .select('*')
      .eq('deal_id', dealId)
      .order('order_index', { ascending: true });
      
    if (milestonesError) {
      console.error("Error fetching milestones:", milestonesError);
      throw new Error(`Error fetching milestones: ${milestonesError.message}`);
    }
    
    // 3. Fetch participant data
    const { data: participantsData, error: participantsError } = await supabaseAdmin
      .from('deal_participants')
      .select(`
        *,
        profiles:user_id (
          name,
          email
        )
      `)
      .eq('deal_id', dealId);
      
    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      throw new Error(`Error fetching participants: ${participantsError.message}`);
    }
    
    // 4. Fetch document data
    const { data: documentsData, error: documentsError } = await supabaseAdmin
      .from('documents')
      .select(`
        *,
        profiles:uploaded_by (
          name
        )
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });
      
    if (documentsError) {
      console.error("Error fetching documents:", documentsError);
      throw new Error(`Error fetching documents: ${documentsError.message}`);
    }
    
    // 5. Fetch recent comments/messages (if available)
    const { data: messagesData, error: messagesError } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    // It's ok if there are no messages, continue with the rest of the data
    
    // Format the data for the OpenAI prompt
    const formattedContext = formatDealContextForPrediction(
      dealData, 
      milestonesData || [], 
      participantsData || [], 
      documentsData || [],
      messagesData || []
    );
    
    // Build the prompt
    const prompt = buildDealPredictionPrompt(formattedContext);
    
    console.log("Making OpenAI API call for prediction...");
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert deal analyst providing structured predictions." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.2,
    });
    
    console.log("OpenAI API response received.");
    
    // Parse the response
    const generatedJsonString = completion.choices[0]?.message?.content;
    
    if (!generatedJsonString) {
      throw new Error("Empty response from OpenAI");
    }
    
    const predictionResult = JSON.parse(generatedJsonString);
    
    // Return the result
    return {
      ...predictionResult,
      disclaimer: predictionResult.disclaimer || "This is an AI-generated prediction based on available data and should not be taken as professional advice or a guarantee."
    };
  } catch (error) {
    console.error("Error generating deal health prediction:", error);
    throw error;
  }
}
