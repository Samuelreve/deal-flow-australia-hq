import OpenAI from "https://esm.sh/openai@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

/**
 * Handler for predicting deal health using AI
 */
export async function handlePredictDealHealth(
  dealId: string,
  openai: OpenAI,
  supabase: ReturnType<typeof createClient>
) {
  try {
    // 1. Fetch deal details
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('title, status, description, created_at')
      .eq('id', dealId)
      .single();
    
    if (dealError || !deal) {
      throw new Error('Deal not found or access denied.');
    }

    // 2. Fetch milestones to assess progress
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('title, status, due_date, completed_at')
      .eq('deal_id', dealId);
    
    if (milestonesError) {
      console.error('Error fetching milestones:', milestonesError);
      // Continue without milestones data
    }

    // 3. Fetch recent activities
    const { data: activities, error: activitiesError } = await supabase
      .from('deal_activities')
      .select('activity_type, created_at, description')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      // Continue without activities data
    }

    // 4. Fetch document count
    const { count: documentCount, error: documentError } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('deal_id', dealId);
    
    if (documentError) {
      console.error('Error counting documents:', documentError);
      // Continue without document count
    }

    // 5. Calculate basic metrics
    const dealAgeInDays = Math.floor((new Date().getTime() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    const completedMilestones = milestones?.filter(m => m.status === 'completed') || [];
    const totalMilestones = milestones?.length || 0;
    const milestoneCompletionRate = totalMilestones > 0 ? (completedMilestones.length / totalMilestones) * 100 : 0;
    
    const overdueMilestones = milestones?.filter(m => {
      if (m.status !== 'completed' && m.due_date) {
        return new Date(m.due_date) < new Date();
      }
      return false;
    }) || [];

    // 6. Construct OpenAI prompt
    const promptContent = `You are a deal health prediction AI. Based on the following deal information, predict the health and likelihood of successful completion for this business transaction:
    
Deal Title: ${deal.title}
Deal Status: ${deal.status}
Deal Age: ${dealAgeInDays} days
Description: ${deal.description || 'No description provided'}

Milestone Progress:
- Total Milestones: ${totalMilestones}
- Completed Milestones: ${completedMilestones.length} (${milestoneCompletionRate.toFixed(1)}%)
- Overdue Milestones: ${overdueMilestones.length}

Document Count: ${documentCount || 'Unknown'}

Recent Activities: ${activities?.length ? activities.map(a => `
- ${a.activity_type}: ${a.description} (${new Date(a.created_at).toLocaleDateString()})`).join('') : 'No recent activities'}

Based on this information, provide:
1. A health score from 0-100 (where 100 is perfect health)
2. A confidence level for your prediction (low, medium, high)
3. Key factors affecting the deal health (positive and negative)
4. Recommendations to improve deal health

Format your response as structured JSON with the following keys:
- score: number
- confidence: string
- factors: array of objects with factor, impact (positive/negative/neutral), and description
- recommendations: array of strings
- summary: string (brief textual summary of the health assessment)`;

    // 7. Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI deal health prediction assistant. Respond with valid JSON only." },
        { role: "user", content: promptContent }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    // 8. Parse the response
    const responseContent = response.choices[0]?.message?.content || '{"error": "Failed to generate prediction"}';
    let prediction;
    
    try {
      prediction = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      prediction = {
        score: 50,
        confidence: "low",
        factors: [{ factor: "Insufficient Data", impact: "neutral", description: "Could not analyze deal health with available information" }],
        recommendations: ["Provide more information about the deal"],
        summary: "Deal health assessment inconclusive due to parsing error"
      };
    }
    
    // 9. Save the prediction to the database
    try {
      await supabase
        .from('deal_health_predictions')
        .insert({
          deal_id: dealId,
          health_score: prediction.score,
          confidence_level: prediction.confidence,
          factors: prediction.factors,
          recommendations: prediction.recommendations,
          summary: prediction.summary,
          created_at: new Date().toISOString()
        });
    } catch (saveError) {
      console.error('Error saving health prediction:', saveError);
      // Continue anyway to return prediction to user
    }
    
    // 10. Return the prediction
    return {
      prediction,
      dealStatus: deal.status,
      disclaimer: "This health prediction is based on available data and AI analysis. It should be used as one of many inputs for decision-making, not as the sole determining factor."
    };
    
  } catch (error: any) {
    console.error('Error in handlePredictDealHealth:', error);
    throw error;
  }
}
