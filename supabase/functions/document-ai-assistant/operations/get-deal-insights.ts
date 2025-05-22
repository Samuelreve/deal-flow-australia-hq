
import { buildDealInsightsPrompt } from "./utils/openai-prompt-builder.ts";
import { fetchUserDealPortfolio } from "./utils/portfolio-data-fetcher.ts";
import { formatDealPortfolioForPrompt } from "./utils/portfolio-formatter.ts";

/**
 * Generate AI insights for a user's deal portfolio
 */
export async function handleGetDealInsights(userId: string, openai: any) {
  try {
    // Fetch the user's deal portfolio
    const { deals, error } = await fetchUserDealPortfolio(userId);
    
    if (error) {
      throw new Error(`Failed to fetch deal portfolio: ${error}`);
    }
    
    if (!deals || deals.length === 0) {
      return {
        insights: [],
        recommendations: ["Start your first deal to get personalized insights"],
        metrics: {},
        insightsText: "You don't have any active deals in your portfolio. Start a new deal to get AI-powered insights.",
        disclaimer: "This is an AI-generated analysis based on your deal portfolio data. It is provided for informational purposes only and should not replace professional judgment."
      };
    }
    
    // Format deal data for the AI prompt
    const formattedDealsData = formatDealPortfolioForPrompt(deals);
    
    // Prepare the OpenAI prompt
    const prompt = buildDealInsightsPrompt(formattedDealsData);

    // Call OpenAI for insights
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using a more efficient model for insights
      messages: [
        {
          role: "system",
          content: "You are an AI business analyst specialized in deal analysis. Provide concise, data-driven insights about the user's deal portfolio."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more factual analysis
      max_tokens: 800  // Adjust based on desired response length
    });

    // Parse the AI response
    const aiResponse = response.choices[0].message.content;
    
    try {
      // Try to parse as JSON first
      const parsedResponse = JSON.parse(aiResponse);
      return {
        ...parsedResponse,
        disclaimer: "This is an AI-generated analysis based on your deal portfolio data. It is provided for informational purposes only and should not replace professional judgment."
      };
    } catch (parseError) {
      // If not valid JSON, return as text
      return {
        insights: [
          { 
            title: "Portfolio Analysis", 
            description: aiResponse, 
            type: "general",
            priority: "medium" 
          }
        ],
        recommendations: ["Review your deal portfolio regularly"],
        metrics: {
          dealCount: deals.length,
          averageHealth: deals.reduce((sum, deal) => sum + (deal.health_score || 0), 0) / deals.length,
        },
        insightsText: aiResponse,
        disclaimer: "This is an AI-generated analysis based on your deal portfolio data. It is provided for informational purposes only and should not replace professional judgment."
      };
    }
  } catch (error) {
    console.error("Error generating deal insights:", error);
    throw new Error(`Failed to generate deal insights: ${error.message}`);
  }
}
