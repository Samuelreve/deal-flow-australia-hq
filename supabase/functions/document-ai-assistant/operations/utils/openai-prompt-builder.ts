
/**
 * Builds a prompt for OpenAI to generate deal portfolio insights
 */
export function buildDealInsightsPrompt(formattedDealsData: string): string {
  return `
You are a business analyst specialized in deal analysis. I need you to analyze the following deal portfolio data and provide insights.

Here's the deal data:
${formattedDealsData}

Analyze this data and provide the following:
1. Generate key insights about the portfolio's health, progress, and potential issues.
2. Identify deals that need immediate attention.
3. Provide recommendations for improving deal outcomes.

Format your response as a JSON object with these fields:
{
  "insights": [
    {
      "title": "Short title for the insight",
      "description": "Detailed explanation of the insight",
      "type": "positive|negative|neutral|general",
      "priority": "high|medium|low"
    }
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ],
  "metrics": {
    "keyMetricName": numericValue
  }
}
`;
}
