
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { DEAL_HEALTH_PREDICTION_PROMPT } from "../../_shared/ai-prompts.ts";
import { fetchDealContextData } from './utils/deal-context-fetcher.ts';

export async function handlePredictDealHealth(
  dealId: string,
  userId: string,
  openai: any
) {
  try {
    console.log(`🎯 Starting deal health prediction for deal ${dealId}`);
    
    // Fetch comprehensive deal data
    const dealContext = await fetchDealContextData(dealId);
    const { deal, documents, participants, milestones } = dealContext;
    
    // Calculate detailed metrics
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const inProgressMilestones = milestones.filter(m => m.status === 'in_progress').length;
    const blockedMilestones = milestones.filter(m => m.status === 'blocked').length;
    
    // Calculate overdue milestones
    const today = new Date();
    const overdueMilestones = milestones.filter(m => {
      if (m.status === 'completed') return false;
      if (!m.due_date) return false;
      return new Date(m.due_date) < today;
    });
    
    // Find longest stalled milestone
    const stalledMilestones = milestones.filter(m => m.status === 'in_progress' || m.status === 'blocked');
    let longestStalledDays = 0;
    stalledMilestones.forEach(m => {
      if (m.updated_at) {
        const daysSinceUpdate = Math.floor((today.getTime() - new Date(m.updated_at).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceUpdate > longestStalledDays) {
          longestStalledDays = daysSinceUpdate;
        }
      }
    });
    
    // Calculate days since last deal activity
    const lastActivity = deal.updated_at ? new Date(deal.updated_at) : null;
    const daysSinceActivity = lastActivity 
      ? Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    // Calculate days until target completion
    const targetDate = deal.target_completion_date ? new Date(deal.target_completion_date) : null;
    const daysUntilTarget = targetDate 
      ? Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    // Build comprehensive context
    const contextPrompt = `Analyze this deal and predict its health trajectory:

=== DEAL OVERVIEW ===
Title: ${deal.title || 'Not specified'}
Status: ${deal.status}
Current Health Score: ${deal.health_score}/100
Asking Price: ${deal.asking_price ? `$${deal.asking_price.toLocaleString()}` : 'Not specified'}
Target Completion: ${deal.target_completion_date || 'Not specified'}
Days Until Target: ${daysUntilTarget !== null ? daysUntilTarget : 'No target set'}
Days Since Last Activity: ${daysSinceActivity !== null ? daysSinceActivity : 'Unknown'}

=== MILESTONE METRICS ===
Total Milestones: ${totalMilestones}
Completed: ${completedMilestones} (${totalMilestones > 0 ? Math.round((completedMilestones/totalMilestones)*100) : 0}%)
In Progress: ${inProgressMilestones}
Blocked: ${blockedMilestones}
Overdue: ${overdueMilestones.length}
Longest Stalled: ${longestStalledDays} days

=== MILESTONE DETAILS ===
${milestones.map(m => {
  const isOverdue = overdueMilestones.includes(m);
  return `- ${m.title}: ${m.status}${isOverdue ? ' [OVERDUE]' : ''}${m.due_date ? ` (Due: ${m.due_date})` : ''}`;
}).join('\n')}

=== ACTIVITY INDICATORS ===
Documents Uploaded: ${documents.length}
Participants: ${participants.length}
Active Roles: ${participants.map(p => p.role).join(', ')}

=== KEY RISK INDICATORS ===
${overdueMilestones.length > 0 ? `⚠️ ${overdueMilestones.length} overdue milestone(s)` : '✅ No overdue milestones'}
${blockedMilestones > 0 ? `⚠️ ${blockedMilestones} blocked milestone(s)` : '✅ No blocked milestones'}
${daysSinceActivity && daysSinceActivity > 7 ? `⚠️ No activity for ${daysSinceActivity} days` : '✅ Recent activity'}
${longestStalledDays > 14 ? `⚠️ Milestone stalled for ${longestStalledDays} days` : ''}
${daysUntilTarget !== null && daysUntilTarget < 30 && completedMilestones/totalMilestones < 0.7 ? `⚠️ Target date approaching with low completion` : ''}

Based on this data, predict the deal health trajectory and return a JSON response following the format in your instructions.`;

    // Call OpenAI with the enhanced prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: DEAL_HEALTH_PREDICTION_PROMPT
        },
        {
          role: "user",
          content: contextPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const responseContent = completion.choices[0].message.content;
    console.log('Deal health prediction generated successfully');
    
    // Try to parse as JSON
    let prediction;
    try {
      const cleanedContent = responseContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      prediction = JSON.parse(cleanedContent);
    } catch {
      // Fallback to basic structure if parsing fails
      prediction = {
        currentHealth: deal.health_score || 50,
        predictedHealth30Days: deal.health_score || 50,
        trajectory: "stable",
        confidence: "low",
        keyDrivers: [responseContent.substring(0, 200)],
        riskFactors: [],
        recommendation: "Unable to parse detailed prediction. Please review deal status manually."
      };
    }

    return {
      prediction: {
        currentScore: prediction.currentHealth || deal.health_score,
        predictedScore30Days: prediction.predictedHealth30Days,
        predictedScore60Days: prediction.predictedHealth60Days,
        predictedScore90Days: prediction.predictedHealth90Days,
        trajectory: prediction.trajectory,
        confidence: prediction.confidence,
        keyDrivers: prediction.keyDrivers || [],
        riskFactors: prediction.riskFactors || [],
        recommendation: prediction.recommendation
      },
      metrics: {
        totalMilestones,
        completedMilestones,
        overdueMilestones: overdueMilestones.length,
        blockedMilestones,
        daysSinceActivity,
        longestStalledDays
      },
      dealStatus: deal.status,
      disclaimer: 'This prediction is AI-generated based on current deal data and historical patterns. Actual outcomes may vary. Use as guidance, not as definitive forecast.'
    };
  } catch (error) {
    console.error('Error in handlePredictDealHealth:', error);
    throw new Error('Failed to predict deal health');
  }
}
