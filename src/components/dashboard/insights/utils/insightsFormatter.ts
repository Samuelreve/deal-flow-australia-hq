
/**
 * Helper function to convert insights object to formatted text
 */
export const formatInsightsToText = (insightsData: any): string => {
  if (!insightsData || !insightsData.insights || !Array.isArray(insightsData.insights)) {
    return "No insights available at this time.";
  }

  let text = "**Overall Portfolio Health:** Your deal portfolio is being analyzed\n\n";
  
  // Add high priority insights first
  const highPriorityInsights = insightsData.insights.filter((i: any) => i.priority === "high");
  if (highPriorityInsights.length > 0) {
    text += "**Deals Needing Attention:**\n";
    highPriorityInsights.forEach((insight: any) => {
      text += `• ${insight.title}: ${insight.description}\n`;
    });
    text += "\n";
  }

  // Add medium/low priority positive insights
  const positiveInsights = insightsData.insights.filter((i: any) => 
    i.priority !== "high" && i.type === "positive");
  if (positiveInsights.length > 0) {
    text += "**Deals Progressing Well:**\n";
    positiveInsights.forEach((insight: any) => {
      text += `• ${insight.title}: ${insight.description}\n`;
    });
    text += "\n";
  }

  // Add recommendations
  if (insightsData.recommendations && insightsData.recommendations.length > 0) {
    text += "**Recommendations:**\n";
    insightsData.recommendations.forEach((rec: string) => {
      text += `• ${rec}\n`;
    });
  }

  return text;
};
