
/**
 * Build prompt for deal insights analysis
 */
export function buildDealInsightsPrompt(formattedDeals: any[]) {
  return `
  Analyze the following deal portfolio and provide actionable insights:
  
  # Deal Portfolio Data
  ${JSON.stringify(formattedDeals, null, 2)}
  
  Based on this data, please provide:
  
  1. An assessment of the overall health of the deal portfolio
  2. Identification of deals that need immediate attention and why
  3. Deals that are progressing well
  4. Key trends or patterns you observe
  5. Specific actionable recommendations
  
  Focus on:
  - Deal progress (milestone completion rates)
  - Deal health scores
  - Time-based metrics (stale deals, time in current status)
  - Potential bottlenecks or blockers
  
  Format your response with clear sections and bullet points for readability.
  `;
}
