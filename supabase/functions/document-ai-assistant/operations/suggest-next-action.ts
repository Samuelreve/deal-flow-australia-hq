
import { fetchDealContextData } from './utils/deal-context-fetcher.ts';
import { NEXT_ACTION_PROMPT } from "../../_shared/ai-prompts.ts";

export async function handleSuggestNextAction(
  dealId: string,
  openai: any
) {
  try {
    console.log(`🎯 Starting next action suggestion for deal ${dealId}`);
    
    // Fetch comprehensive deal data
    const dealContext = await fetchDealContextData(dealId);
    const { deal, documents, participants, milestones } = dealContext;
    
    // Calculate milestone progress
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const inProgressMilestones = milestones.filter(m => m.status === 'in_progress').length;
    const blockedMilestones = milestones.filter(m => m.status === 'blocked').length;
    const notStartedMilestones = milestones.filter(m => m.status === 'not_started').length;
    
    // Identify overdue milestones
    const today = new Date();
    const overdueMilestones = milestones.filter(m => {
      if (m.status === 'completed') return false;
      if (!m.due_date) return false;
      return new Date(m.due_date) < today;
    });
    
    // Calculate days since last activity (based on deal updated_at)
    const lastActivity = deal.updated_at ? new Date(deal.updated_at) : null;
    const daysSinceActivity = lastActivity 
      ? Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    // Build comprehensive context for the AI
    const contextPrompt = `Analyze this deal and suggest the single most impactful next action:

=== DEAL INFORMATION ===
Title: ${deal.title || 'Not specified'}
Business Name: ${deal.business_legal_name || 'Not specified'}
Status: ${deal.status}
Health Score: ${deal.health_score}/100
Asking Price: ${deal.asking_price ? `$${deal.asking_price.toLocaleString()}` : 'Not specified'}
Target Completion: ${deal.target_completion_date || 'Not specified'}
Days Since Last Activity: ${daysSinceActivity !== null ? daysSinceActivity : 'Unknown'}

=== MILESTONE PROGRESS ===
Total Milestones: ${totalMilestones}
Completed: ${completedMilestones} (${totalMilestones > 0 ? Math.round((completedMilestones/totalMilestones)*100) : 0}%)
In Progress: ${inProgressMilestones}
Blocked: ${blockedMilestones}
Not Started: ${notStartedMilestones}
Overdue: ${overdueMilestones.length}

=== MILESTONE DETAILS ===
${milestones.map(m => {
  const dueInfo = m.due_date ? ` (Due: ${m.due_date})` : '';
  const overdue = overdueMilestones.includes(m) ? ' [OVERDUE]' : '';
  return `- ${m.title}: ${m.status}${dueInfo}${overdue}`;
}).join('\n')}

=== PARTICIPANTS (${participants.length}) ===
${participants.map(p => `- ${p.profiles?.name || 'Unknown'} (${p.role})`).join('\n')}

=== DOCUMENTS (${documents.length}) ===
${documents.length > 0 
  ? documents.slice(0, 10).map(d => `- ${d.name} (${d.type})`).join('\n')
  : 'No documents uploaded yet'}

Based on this information, return a JSON object with ONE specific next action following the format in your instructions.`;

    // Call OpenAI with the enhanced prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: NEXT_ACTION_PROMPT
        },
        {
          role: "user",
          content: contextPrompt
        }
      ],
      temperature: 0.4,
      max_tokens: 600
    });

    const responseContent = completion.choices[0].message.content;
    console.log('Next action suggestion generated successfully');
    
    // Try to parse as JSON, fall back to text
    let parsedResponse;
    try {
      // Clean potential markdown formatting
      const cleanedContent = responseContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsedResponse = JSON.parse(cleanedContent);
    } catch {
      // If not valid JSON, return as text suggestion
      parsedResponse = {
        action: responseContent,
        reasoning: "AI-generated recommendation based on deal analysis",
        urgency: "medium",
        owner: "Deal team"
      };
    }
    
    return {
      suggestion: parsedResponse.action || responseContent,
      reasoning: parsedResponse.reasoning,
      impact: parsedResponse.impact,
      urgency: parsedResponse.urgency || "medium",
      deadline: parsedResponse.deadline,
      owner: parsedResponse.owner,
      dealStatus: deal.status,
      healthScore: deal.health_score,
      disclaimer: "This suggestion is AI-generated based on your current deal data. Please review and adapt as needed for your specific situation."
    };
    
  } catch (error) {
    console.error('Error in handleSuggestNextAction:', error);
    throw new Error('Failed to suggest next action');
  }
}
