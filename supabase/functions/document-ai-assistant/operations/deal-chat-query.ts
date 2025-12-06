
export async function handleDealChatQuery(
  dealId: string,
  userId: string,
  query: string,
  chatHistory: any[],
  openai: any,
  dealContext?: any
) {
  try {
    if (!query || query.trim().length === 0) {
      return {
        answer: 'Please provide a question about your deal.',
        chatResponse: 'No query provided.',
        disclaimer: 'Deal chat requires a valid question.'
      };
    }

    // Build comprehensive deal context for AI
    let contextInfo = '';
    
    if (dealContext) {
      // Deal basic information
      if (dealContext.deal) {
        const deal = dealContext.deal;
        contextInfo += `\n\n**DEAL INFORMATION:**
- Deal Title: ${deal.title || 'N/A'}
- Status: ${deal.status || 'N/A'}
- Health Score: ${deal.health_score || 0}/100
- Industry: ${deal.business_industry || 'N/A'}
- Asking Price: ${deal.asking_price ? '$' + deal.asking_price.toLocaleString() : 'N/A'}
- Business Legal Name: ${deal.business_legal_name || 'N/A'}
- Years in Operation: ${deal.business_years_in_operation || 'N/A'}
- Reason for Selling: ${deal.reason_for_selling || 'N/A'}`;
      }

      // Milestones information
      if (dealContext.milestones && dealContext.milestones.length > 0) {
        contextInfo += `\n\n**MILESTONES (${dealContext.milestones.length} total):**`;
        dealContext.milestones.forEach((milestone: any, index: number) => {
          contextInfo += `\n${index + 1}. ${milestone.title} - Status: ${milestone.status}`;
          if (milestone.due_date) {
            contextInfo += ` (Due: ${new Date(milestone.due_date).toLocaleDateString()})`;
          }
        });
      }

      // Documents information
      if (dealContext.documents && dealContext.documents.length > 0) {
        contextInfo += `\n\n**DOCUMENTS (${dealContext.documents.length} total):**`;
        dealContext.documents.slice(0, 10).forEach((doc: any, index: number) => {
          contextInfo += `\n${index + 1}. ${doc.name} - Status: ${doc.status} - Category: ${doc.category || 'General'}`;
        });
      }

      // Participants information
      if (dealContext.participants && dealContext.participants.length > 0) {
        contextInfo += `\n\n**PARTICIPANTS (${dealContext.participants.length} total):**`;
        dealContext.participants.forEach((participant: any, index: number) => {
          const name = participant.profile?.name || 'Unknown';
          contextInfo += `\n${index + 1}. ${name} - Role: ${participant.role}`;
        });
      }

      // Recent comments
      if (dealContext.comments && dealContext.comments.length > 0) {
        contextInfo += `\n\n**RECENT ACTIVITY (${dealContext.comments.length} recent comments):**`;
        dealContext.comments.slice(0, 5).forEach((comment: any, index: number) => {
          const author = comment.user?.name || 'Unknown';
          const date = new Date(comment.created_at).toLocaleDateString();
          contextInfo += `\n${index + 1}. ${author} (${date}): ${comment.content.substring(0, 100)}${comment.content.length > 100 ? '...' : ''}`;
        });
      }

      // Health history
      if (dealContext.healthHistory && dealContext.healthHistory.length > 0) {
        contextInfo += `\n\n**HEALTH SCORE HISTORY:**`;
        dealContext.healthHistory.slice(0, 3).forEach((history: any, index: number) => {
          const date = new Date(history.created_at).toLocaleDateString();
          contextInfo += `\n${index + 1}. ${date}: ${history.health_score}/100`;
          if (history.change_reason) {
            contextInfo += ` (${history.change_reason})`;
          }
        });
      }
    }

    // Import enhanced system prompt
    const { DEAL_CHAT_SYSTEM_PROMPT } = await import("../_shared/ai-prompts.ts");
    
    // Use enhanced AI responses with deal context
    const systemPrompt = DEAL_CHAT_SYSTEM_PROMPT;

    const userMessage = `Deal ID: ${dealId}
User Query: ${query}

${contextInfo}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const answer = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';

    return {
      answer,
      chatResponse: answer,
      sources: [],
      disclaimer: 'AI-generated response based on your deal data and general business knowledge. Please verify important decisions with qualified professionals.'
    };
  } catch (error) {
    console.error('Error in handleDealChatQuery:', error);
    throw new Error('Failed to process chat query');
  }
}
