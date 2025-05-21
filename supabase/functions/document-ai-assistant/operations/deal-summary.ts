
import { fetchDealData } from "./deal-utils.ts";

/**
 * Handles the summarize deal operation to generate a comprehensive deal summary
 */
export async function handleDealSummary(
  dealId: string,
  openai: any
) {
  if (!dealId) {
    throw new Error("Deal ID is required for deal summary generation");
  }

  try {
    // Fetch the deal data for summarization
    const dealData = await fetchDealData(dealId);

    // Generate summary using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // More efficient model for text summarization
      messages: [
        {
          role: "system",
          content: "You are a deal summary assistant that provides clear, concise overviews of business deals. Summarize the provided deal information in a professional manner."
        },
        {
          role: "user",
          content: `Please provide a summary of the following deal: ${JSON.stringify(dealData)}`
        }
      ],
      temperature: 0.3, // Lower temperature for more factual responses
      max_tokens: 500  // Limit response length
    });

    // Extract and return the summary
    const summary = response.choices[0].message.content;

    return {
      summary,
      dealDetails: {
        title: dealData.title,
        status: dealData.status,
        value: dealData.value
      },
      disclaimer: "This summary is AI-generated and provided for informational purposes only. It may not capture all details of the deal."
    };
  } catch (error) {
    console.error("Error generating deal summary:", error);
    throw new Error(`Failed to generate deal summary: ${error.message}`);
  }
}
