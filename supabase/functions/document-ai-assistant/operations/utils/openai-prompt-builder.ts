
/**
 * Build the prompt for the OpenAI API to generate deal insights
 */
export function buildDealInsightsPrompt(formattedDealsData: string): string {
  return `You are an expert business analyst and deal strategist. Your task is to provide high-level strategic insights and actionable recommendations based on the provided deal portfolio data.

Analyze the following deals for trends, potential risks, and opportunities. Identify deals that require immediate attention or are progressing well.

Deal Portfolio Data:
${formattedDealsData}

Provide your insights in the following format:
- **Overall Portfolio Health:** [Brief assessment]
- **Deals Needing Attention:** [List 1-3 deals and why, e.g., low health, overdue milestones, stalled]
- **Deals Progressing Well:** [List 1-2 deals and why]
- **Key Trends/Observations:** [e.g., Common bottlenecks, types of deals performing best]
- **Actionable Recommendations:** [1-3 general recommendations for the user to improve their deal flow]

**Important Rules:**
1. Base your insights and recommendations **ONLY** on the data provided. Do not make up information.
2. Be concise and professional.
3. Do not provide legal or financial advice.
4. If data is insufficient for an insight, state that.
`;
}
