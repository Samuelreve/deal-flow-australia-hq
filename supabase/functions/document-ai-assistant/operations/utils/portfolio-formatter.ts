
/**
 * Formats deal portfolio data for the OpenAI prompt
 */
export function formatDealPortfolioForPrompt(deals: any[]): string {
  try {
    // Filter out sensitive or unnecessary data
    const formattedDeals = deals.map(deal => {
      // Calculate milestone completion percentage
      const totalMilestones = deal.milestones?.length || 0;
      const completedMilestones = deal.milestones?.filter((m: any) => m.status === 'completed').length || 0;
      const milestoneCompletionPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones * 100) : 0;
      
      // Calculate days since last update
      const lastUpdate = new Date(deal.updated_at);
      const today = new Date();
      const daysSinceLastUpdate = Math.floor((today.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));
      
      return {
        title: deal.title,
        status: deal.status,
        health_score: deal.health_score || "N/A",
        description: deal.description?.substring(0, 100) + (deal.description?.length > 100 ? "..." : "") || "No description",
        deal_type: deal.deal_type || "Not specified",
        asking_price: deal.asking_price || "Not specified",
        created_at: deal.created_at,
        days_since_last_update: daysSinceLastUpdate,
        milestone_completion: `${milestoneCompletionPercentage.toFixed(0)}% (${completedMilestones}/${totalMilestones})`,
        document_count: deal.documents?.length || 0,
        participant_count: deal.participants?.length || 0
      };
    });
    
    // Create summary statistics
    const activeDealCount = deals.filter(d => d.status === 'active').length;
    const completedDealCount = deals.filter(d => d.status === 'completed').length;
    const averageHealthScore = deals.reduce((sum, deal) => sum + (deal.health_score || 0), 0) / deals.length;
    
    // Format as string
    return JSON.stringify({
      deals: formattedDeals,
      summary: {
        total_deals: deals.length,
        active_deals: activeDealCount,
        completed_deals: completedDealCount,
        average_health_score: averageHealthScore.toFixed(1)
      }
    }, null, 2);
  } catch (error) {
    console.error("Error formatting deal portfolio:", error);
    return JSON.stringify({ error: "Error formatting deal data" });
  }
}
