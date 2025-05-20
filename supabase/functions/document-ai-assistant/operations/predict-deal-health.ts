
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { OpenAI } from "https://esm.sh/openai@4.35.0";

// Define response type
export interface DealHealthPredictionResponse {
  probability_of_success_percentage: number;
  confidence_level: "High" | "Medium" | "Low";
  prediction_reasoning: string;
  suggested_improvements: Array<{
    area: string;
    recommendation: string;
    impact: "High" | "Medium" | "Low";
  }>;
  disclaimer: string;
}

export async function handlePredictDealHealth(
  supabaseAdmin: ReturnType<typeof createClient>, 
  openai: OpenAI,
  userId: string,
  dealId: string,
): Promise<DealHealthPredictionResponse> {
  try {
    // Verify user is a participant in the deal
    const { data: participant, error: participantError } = await supabaseAdmin
      .from("deal_participants")
      .select("role")
      .eq("deal_id", dealId)
      .eq("user_id", userId)
      .single();
      
    if (participantError || !participant) {
      throw new Error("You are not a participant in this deal");
    }

    // 1. Fetch comprehensive deal data
    const { data: dealData, error: dealError } = await supabaseAdmin
      .from("deals")
      .select(`
        *,
        seller:seller_id(name:profiles(name)),
        buyer:buyer_id(name:profiles(name))
      `)
      .eq("id", dealId)
      .single();
      
    if (dealError || !dealData) {
      throw new Error("Deal not found");
    }

    // 2. Fetch milestones
    const { data: milestonesData, error: milestonesError } = await supabaseAdmin
      .from("milestones")
      .select("*")
      .eq("deal_id", dealId)
      .order("order_index", { ascending: true });
      
    if (milestonesError) {
      throw new Error("Error fetching milestones data");
    }

    // 3. Fetch participants
    const { data: participantsData, error: participantsError } = await supabaseAdmin
      .from("deal_participants")
      .select("*, user:user_id(name:profiles(name))")
      .eq("deal_id", dealId);
      
    if (participantsError) {
      throw new Error("Error fetching participants data");
    }

    // 4. Fetch documents summary
    const { data: documentsData, error: documentsError } = await supabaseAdmin
      .from("documents")
      .select("id, name, type, category, created_at")
      .eq("deal_id", dealId);
      
    if (documentsError) {
      throw new Error("Error fetching documents data");
    }

    // 5. Calculate derived metrics
    const totalMilestones = milestonesData?.length || 0;
    const completedMilestones = milestonesData?.filter(m => m.status === "completed").length || 0;
    const blockedMilestones = milestonesData?.filter(m => m.status === "blocked").length || 0;
    const overdueMilestones = milestonesData?.filter(m => {
      return m.status !== "completed" && m.due_date && new Date(m.due_date) < new Date();
    }).length || 0;

    const documentCategories = documentsData?.reduce((acc, doc) => {
      acc[doc.category || doc.type || "uncategorized"] = (acc[doc.category || doc.type || "uncategorized"] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const dealAgeDays = dealData.created_at 
      ? Math.floor((new Date().getTime() - new Date(dealData.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // 6. Format data for the prompt
    let formattedContext = `Current Deal Status and Progress for Deal: ${dealData.title} (ID: ${dealId})\n`;
    formattedContext += `Business: ${dealData.business_legal_name || "N/A"}\n`;
    formattedContext += `Deal Type: ${dealData.deal_type || "N/A"}\n`;
    formattedContext += `Current Overall Status: ${dealData.status} (Health Score: ${dealData.health_score}%)\n`;
    formattedContext += `Deal Age: ${dealAgeDays} days\n`;
    formattedContext += `Asking Price: $${dealData.asking_price || "N/A"}\n`;
    formattedContext += `Reason for Selling: ${dealData.reason_for_selling || "N/A"}\n\n`;

    formattedContext += `Milestone Breakdown (${completedMilestones}/${totalMilestones} completed, ${overdueMilestones} overdue, ${blockedMilestones} blocked):\n`;
    if (milestonesData && milestonesData.length > 0) {
      milestonesData.forEach(m => {
        formattedContext += `- ${m.title}: ${m.status}${m.due_date ? ` (Due: ${new Date(m.due_date).toLocaleDateString()})` : ''}${m.completed_at ? ` (Completed: ${new Date(m.completed_at).toLocaleDateString()})` : ''}\n`;
      });
    } else {
      formattedContext += "No milestones defined for this deal.\n";
    }
    formattedContext += `\n`;

    formattedContext += `Key Participants: `;
    if (participantsData && participantsData.length > 0) {
      formattedContext += participantsData
        .map(p => `${p.user?.name || "Unknown"} (${p.role})`)
        .join(", ");
    } else {
      formattedContext += "None";
    }
    formattedContext += `\n\n`;

    formattedContext += `Document Summary:\n`;
    if (Object.keys(documentCategories).length > 0) {
      for (const [category, count] of Object.entries(documentCategories)) {
        formattedContext += `- ${category}: ${count} document(s)\n`;
      }
    } else {
      formattedContext += "No documents uploaded for this deal.\n";
    }
    formattedContext += `\n`;

    // 7. Construct OpenAI prompt
    const messages = [
      {
        role: "system",
        content: `You are an expert business deal strategist and risk analyst. Your task is to analyze the provided deal data, predict its probability of success, and suggest actionable improvements to increase that probability or accelerate the deal.`
      },
      {
        role: "user",
        content: `Deal Context:
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
5. If data is insufficient for a strong prediction, state that in 'prediction_reasoning' and use 'Low' confidence.`
      }
    ];

    // 8. Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.2,
    });

    // 9. Process and return the response
    const generatedJsonString = completion.choices[0]?.message?.content || "{}";
    let predictionResult: DealHealthPredictionResponse;
    
    try {
      predictionResult = JSON.parse(generatedJsonString);
      
      // Ensure the required fields exist
      if (!predictionResult.probability_of_success_percentage) {
        predictionResult.probability_of_success_percentage = 50;
      }
      
      if (!predictionResult.confidence_level) {
        predictionResult.confidence_level = "Low";
      }
      
      if (!predictionResult.prediction_reasoning) {
        predictionResult.prediction_reasoning = "Insufficient data to provide a detailed reasoning.";
      }
      
      if (!Array.isArray(predictionResult.suggested_improvements)) {
        predictionResult.suggested_improvements = [];
      }
      
      if (!predictionResult.disclaimer) {
        predictionResult.disclaimer = "This is an AI-generated prediction based on available data and should not be taken as professional advice or a guarantee.";
      }
      
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      
      // Return a fallback prediction
      predictionResult = {
        probability_of_success_percentage: 50,
        confidence_level: "Low",
        prediction_reasoning: "The AI assistant encountered an error while generating the prediction.",
        suggested_improvements: [
          {
            area: "General",
            recommendation: "Please try again later or contact support if the issue persists.",
            impact: "Medium"
          }
        ],
        disclaimer: "This is an AI-generated prediction based on available data and should not be taken as professional advice or a guarantee."
      };
    }

    return predictionResult;
    
  } catch (error) {
    console.error("Error in handlePredictDealHealth:", error);
    throw error;
  }
}
