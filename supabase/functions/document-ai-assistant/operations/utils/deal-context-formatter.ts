
import { formatDate } from "./utils.ts";

/**
 * Format the deal data into a readable text format for the AI prompt
 */
export function formatDealContextForPrompt(dealContext: any) {
  const { deal, milestones, participants, documents, comments } = dealContext;
  
  let formattedContext = `Current Deal Details:\n`;
  
  // Deal information
  formattedContext += `Deal Title: ${deal.title}\n`;
  formattedContext += `Business: ${deal.business_legal_name || 'Not specified'}\n`;
  formattedContext += `Status: ${deal.status} (Health Score: ${deal.health_score}%)\n`;
  formattedContext += `Type: ${deal.deal_type || 'Not specified'} | Asking Price: $${deal.asking_price || 'Not specified'}\n`;
  formattedContext += `Seller: ${deal.seller?.name || 'Unassigned'}\n`;
  formattedContext += `Buyer: ${deal.buyer?.name || 'Unassigned'}\n`;
  
  if (deal.reason_for_selling) {
    formattedContext += `Reason for Selling: ${deal.reason_for_selling}\n`;
  }
  
  const createdDate = formatDate(deal.created_at);
  const targetDate = formatDate(deal.target_completion_date);
  
  formattedContext += `Timeline: Created on ${createdDate} | Target Completion: ${targetDate}\n\n`;
  
  // Milestones information
  formattedContext += `Milestones (${milestones.length}):\n`;
  if (milestones.length > 0) {
    milestones.forEach(m => {
      const dueDate = formatDate(m.due_date);
      const completedDate = m.completed_at ? formatDate(m.completed_at) : '';
      
      formattedContext += `- ${m.title}: ${m.status} (Due: ${dueDate}${completedDate ? `, Completed: ${completedDate}` : ''})\n`;
      if (m.description) {
        formattedContext += `  Description: ${m.description}\n`;
      }
    });
  } else {
    formattedContext += `No milestones have been set for this deal.\n`;
  }
  formattedContext += '\n';
  
  // Participants information
  formattedContext += `Participants (${participants.length}):\n`;
  if (participants.length > 0) {
    participants.forEach(p => {
      formattedContext += `- ${p.profiles?.name || 'Unknown'} (${p.role})\n`;
    });
  } else {
    formattedContext += `No participants found for this deal.\n`;
  }
  formattedContext += '\n';
  
  // Documents information
  if (documents.length > 0) {
    formattedContext += `Recent Documents (${documents.length}):\n`;
    documents.forEach(doc => {
      const uploadDate = formatDate(doc.created_at);
      formattedContext += `- ${doc.name} (${doc.type || 'Unknown'}, Status: ${doc.status}) uploaded by ${doc.profiles?.name || 'Unknown'} on ${uploadDate}\n`;
    });
    formattedContext += '\n';
  }
  
  // Comments information
  if (comments.length > 0) {
    formattedContext += `Recent Comments (${comments.length}):\n`;
    comments.forEach(comment => {
      const commentDate = new Date(comment.created_at).toLocaleString();
      formattedContext += `- ${comment.profiles?.name || 'Unknown'} (${commentDate}): ${comment.content}\n`;
    });
    formattedContext += '\n';
  }
  
  return formattedContext;
}
