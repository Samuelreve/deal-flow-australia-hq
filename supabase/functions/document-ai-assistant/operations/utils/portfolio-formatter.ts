
import { formatDate } from "../utils.ts";

/**
 * Format deal data for the AI prompt
 */
export function formatDealPortfolioForPrompt(deals: any[]) {
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
      deal.milestones.forEach((m: any) => {
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
      ? deal.participants.map((p: any) => p.role).join(', ')
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
