
/**
 * Format deal portfolio data for use in AI prompts
 */
export function formatDealPortfolioForPrompt(deals: any[]) {
  return deals.map(deal => {
    // Calculate milestone statistics
    const totalMilestones = deal.milestones?.length || 0;
    const completedMilestones = deal.milestones?.filter((m: any) => m.status === 'completed').length || 0;
    const blockedMilestones = deal.milestones?.filter((m: any) => m.status === 'blocked').length || 0;
    
    // Calculate time metrics
    const createdDate = new Date(deal.created_at);
    const updatedDate = new Date(deal.updated_at);
    const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceUpdate = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Organize participants by role
    const participantsByRole: Record<string, number> = {};
    deal.participants?.forEach((p: any) => {
      const role = p.role || 'unknown';
      participantsByRole[role] = (participantsByRole[role] || 0) + 1;
    });
    
    // Format for prompt
    return {
      id: deal.id,
      title: deal.title,
      status: deal.status,
      type: deal.deal_type,
      health_score: deal.health_score,
      asking_price: deal.asking_price,
      description: deal.description?.substring(0, 100) + (deal.description?.length > 100 ? '...' : '') || 'No description',
      progress: {
        total_milestones: totalMilestones,
        completed_milestones: completedMilestones,
        blocked_milestones: blockedMilestones,
        completion_percentage: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
      },
      documents_count: deal.documents?.length || 0,
      participants: participantsByRole,
      time_metrics: {
        days_since_creation: daysSinceCreation,
        days_since_update: daysSinceUpdate,
        is_stale: daysSinceUpdate > 14
      }
    };
  });
}
