
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

function getSupabaseAdmin() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

export async function handlePredictDealHealth(
  dealId: string,
  userId: string,
  openai: any
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Fetch comprehensive deal data
    const { data: dealData, error: dealError } = await supabaseAdmin
      .from('deals')
      .select(`
        id, title, business_legal_name, description, status, health_score, 
        deal_type, asking_price, reason_for_selling, created_at, 
        target_completion_date, seller_id,
        seller:profiles!seller_id(name)
      `)
      .eq('id', dealId)
      .single();

    if (dealError || !dealData) {
      throw new Error('Deal not found or access denied');
    }

    // Fetch milestones data
    const { data: milestonesData, error: milestonesError } = await supabaseAdmin
      .from('milestones')
      .select('title, status, due_date, completed_at, description, order_index')
      .eq('deal_id', dealId)
      .order('order_index', { ascending: true });

    if (milestonesError) {
      console.error('Error fetching milestones:', milestonesError);
    }

    // Fetch participants data
    const { data: participantsData, error: participantsError } = await supabaseAdmin
      .from('deal_participants')
      .select('role, profiles:user_id(name, email)')
      .eq('deal_id', dealId);

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
    }

    // Fetch document count
    const { count: documentCount, error: documentError } = await supabaseAdmin
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('deal_id', dealId);

    if (documentError) {
      console.error('Error counting documents:', documentError);
    }

    // Fetch recent message activity
    const { count: messageCount, error: messageError } = await supabaseAdmin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('deal_id', dealId);

    if (messageError) {
      console.error('Error counting messages:', messageError);
    }

    // Calculate key metrics
    const milestones = milestonesData || [];
    const participants = participantsData || [];
    
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const blockedMilestones = milestones.filter(m => m.status === 'blocked').length;
    const inProgressMilestones = milestones.filter(m => m.status === 'in_progress').length;
    
    const now = new Date();
    const overdueMilestones = milestones.filter(m => 
      m.status !== 'completed' && 
      m.due_date && 
      new Date(m.due_date) < now
    ).length;
    
    const dealAgeDays = Math.floor(
      (now.getTime() - new Date(dealData.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Format context for AI
    let formattedContext = `Current Deal Status and Progress for Deal: ${dealData.title} (ID: ${dealId})\n`;
    formattedContext += `Business: ${dealData.business_legal_name || 'N/A'}\n`;
    formattedContext += `Deal Type: ${dealData.deal_type || 'N/A'}\n`;
    formattedContext += `Current Overall Status: ${dealData.status} (Health Score: ${dealData.health_score || 0}%)\n`;
    formattedContext += `Deal Age: ${dealAgeDays} days\n`;
    formattedContext += `Asking Price: ${dealData.asking_price ? '$' + dealData.asking_price.toLocaleString() : 'N/A'}\n`;
    formattedContext += `Reason for Selling: ${dealData.reason_for_selling || 'N/A'}\n`;
    formattedContext += `Creator: ${dealData.seller?.name || 'N/A'}\n`;
    formattedContext += `Target Completion: ${dealData.target_completion_date ? new Date(dealData.target_completion_date).toLocaleDateString() : 'N/A'}\n\n`;

    formattedContext += `Milestone Progress Overview:\n`;
    formattedContext += `- Total Milestones: ${totalMilestones}\n`;
    formattedContext += `- Completed: ${completedMilestones} (${totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}%)\n`;
    formattedContext += `- In Progress: ${inProgressMilestones}\n`;
    formattedContext += `- Blocked: ${blockedMilestones}\n`;
    formattedContext += `- Overdue: ${overdueMilestones}\n\n`;

    if (milestones.length > 0) {
      formattedContext += `Detailed Milestone Status:\n`;
      milestones.forEach(m => {
        formattedContext += `- ${m.title}: ${m.status}`;
        if (m.due_date) {
          formattedContext += ` (Due: ${new Date(m.due_date).toLocaleDateString()})`;
        }
        if (m.completed_at) {
          formattedContext += ` (Completed: ${new Date(m.completed_at).toLocaleDateString()})`;
        }
        formattedContext += '\n';
      });
      formattedContext += '\n';
    }

    formattedContext += `Team & Collaboration:\n`;
    formattedContext += `- Participants: ${participants.length} (${participants.map(p => `${p.profiles?.name || 'N/A'} (${p.role})`).join(', ')})\n`;
    formattedContext += `- Documents: ${documentCount || 0}\n`;
    formattedContext += `- Messages: ${messageCount || 0}\n\n`;

    if (dealData.description) {
      formattedContext += `Deal Description: ${dealData.description}\n\n`;
    }

    // Construct OpenAI prompt
    const promptContent = `You are an expert business deal strategist and risk analyst. Your task is to analyze the provided deal data, predict its probability of success, and suggest actionable improvements to increase that probability or accelerate the deal.

Deal Context:
${formattedContext}

Provide your analysis in the following structured JSON format:
{
  "probability_of_success_percentage": [Integer from 0-100],
  "confidence_level": "[High|Medium|Low]",
  "prediction_reasoning": "[Brief explanation of why this prediction - 2-3 sentences max]",
  "suggested_improvements": [
    { "area": "[e.g., Milestones, Documents, Communication, Participants]", "recommendation": "[Specific actionable step]", "impact": "[High|Medium|Low]" },
    { "area": "...", "recommendation": "...", "impact": "..." }
  ],
  "disclaimer": "This is an AI-generated prediction based on available data and should not be taken as professional advice or a guarantee."
}

**Important Rules:**
1. Base your prediction and suggestions **ONLY** on the 'Deal Context' provided. Do not make up information.
2. The 'probability_of_success_percentage' must be an integer between 0 and 100.
3. Provide 3-5 specific, actionable recommendations related to the deal's current state.
4. Do NOT provide legal or financial advice.
5. If data is insufficient for a strong prediction, state that in 'prediction_reasoning' and use 'Low' confidence.
6. Focus on process improvements, milestone management, communication, and team coordination.
7. Ensure the 'disclaimer' is always included as the last field in the JSON.

Consider these factors in your analysis:
- Milestone completion rate and timeline adherence
- Deal age vs. target completion date
- Team participation and communication levels
- Document preparation and sharing
- Current health score trends
- Deal complexity and type`;

    // Call OpenAI API
    const messages = [
      { 
        role: "system", 
        content: "You are an expert business deal strategist and risk analyst. Always output valid JSON in the exact format requested." 
      },
      { role: "user", content: promptContent }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.2
    });

    const generatedJsonString = completion.choices[0]?.message?.content || '{}';
    
    let aiResponseContent;
    try {
      aiResponseContent = JSON.parse(generatedJsonString);
    } catch (e) {
      console.error('Failed to parse AI prediction JSON:', e);
      // Fallback response
      aiResponseContent = {
        probability_of_success_percentage: 50,
        confidence_level: "Low",
        prediction_reasoning: "Could not analyze deal health with available information due to processing error.",
        suggested_improvements: [
          {
            area: "Data Quality",
            recommendation: "Ensure all deal information is properly recorded and up to date",
            impact: "High"
          }
        ],
        disclaimer: "This is an AI-generated prediction based on available data and should not be taken as professional advice or a guarantee."
      };
    }

    // Validate response structure
    if (!aiResponseContent.probability_of_success_percentage || 
        !aiResponseContent.confidence_level || 
        !aiResponseContent.prediction_reasoning ||
        !Array.isArray(aiResponseContent.suggested_improvements)) {
      throw new Error('AI response missing required fields');
    }

    // Ensure probability is within valid range
    const probability = Math.max(0, Math.min(100, parseInt(aiResponseContent.probability_of_success_percentage)));
    aiResponseContent.probability_of_success_percentage = probability;

    // Save prediction to database for future reference
    try {
      await supabaseAdmin
        .from('deal_health_predictions')
        .insert({
          deal_id: dealId,
          user_id: userId,
          probability_percentage: probability,
          confidence_level: aiResponseContent.confidence_level,
          reasoning: aiResponseContent.prediction_reasoning,
          suggested_improvements: aiResponseContent.suggested_improvements
        });
    } catch (saveError) {
      console.error('Error saving health prediction:', saveError);
      // Continue anyway - prediction generation is more important than saving
    }

    return {
      success: true,
      ...aiResponseContent
    };

  } catch (error) {
    console.error('Error in handlePredictDealHealth:', error);
    throw new Error(`Failed to predict deal health: ${error.message}`);
  }
}
