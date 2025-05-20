
import { fetchDealData } from "./deal-data.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

function getSupabaseAdmin() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Generate milestones for a deal using AI
 */
export async function handleGenerateMilestones(
  dealId: string,
  userId: string,
  context?: Record<string, any>,
  openai?: any
): Promise<{
  milestones: Array<{ name: string; description: string; order: number }>;
  dealData?: Record<string, any>;
  disclaimer: string;
}> {
  try {
    // Get deal data to use in the prompt
    const supabaseAdmin = getSupabaseAdmin();
    const dealData = await fetchDealData(dealId, supabaseAdmin);
    
    if (!dealData || !dealData.deal) {
      throw new Error("Deal data not found");
    }
    
    // Check user authorization - admin, seller, or lawyer roles
    const { data: userRole } = await supabaseAdmin
      .from('deal_participants')
      .select('role')
      .eq('deal_id', dealId)
      .eq('user_id', userId)
      .single();
      
    if (!userRole || !['admin', 'seller', 'lawyer'].includes(userRole.role.toLowerCase())) {
      throw new Error("User not authorized to generate milestones");
    }

    // Extract deal information
    const deal = dealData.deal;
    const dealType = context?.dealType || deal.deal_type || "Asset Sale";
    const businessName = deal.business_legal_name || deal.title || "Untitled Business";
    const businessEntity = deal.business_legal_entity_type || "Company";
    const businessIndustry = deal.business_industry || "General Business";
    
    // Construct the prompt
    const prompt = `Generate a list of standard milestones for a business sale transaction.
The deal type is: ${dealType}.
The business being sold is: ${businessName}, which is a ${businessEntity} in the ${businessIndustry} industry.

Provide each milestone with a concise name, a brief description of the typical steps involved, and a suggested sequential order number.
Output the milestones as a JSON array, where each object has 'name' (string), 'description' (string), and 'order' (number).

Example JSON format:
[
  { "name": "Initial Contact", "description": "First communication with potential buyer.", "order": 10 },
  { "name": "NDA Signed", "description": "Non-Disclosure Agreement executed.", "order": 20 }
]

Be specific to Australian legal and business practices where applicable, and ensure milestones cover the entire process from initial contact through to closing.`;

    console.log("Generating milestones with prompt:", prompt.substring(0, 100) + "...");

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Or another suitable model
      messages: [
        { 
          role: "system", 
          content: "You are an expert legal and business transaction advisor, generating standard milestones for deals." 
        },
        { 
          role: "user", 
          content: prompt 
        },
      ],
      response_format: { type: "json_object" }, // Request JSON output
      max_tokens: 1500, // Adjust based on expected number/length of milestones
      temperature: 0.5, // Keep low for predictable, factual output
    });

    // Extract and parse the response
    const generatedJsonString = completion.choices[0]?.message?.content;
    if (!generatedJsonString) {
      throw new Error("Failed to generate milestones");
    }

    // Parse the JSON
    let milestonesData;
    try {
      const parsedJson = JSON.parse(generatedJsonString);
      milestonesData = parsedJson.milestones || parsedJson; // Handle different formats
      
      // Validate structure
      if (!Array.isArray(milestonesData)) {
        throw new Error("Generated data is not an array");
      }
      
      // Ensure each milestone has required fields
      milestonesData = milestonesData.map((milestone: any, index: number) => {
        return {
          name: milestone.name || `Milestone ${index + 1}`,
          description: milestone.description || "No description provided",
          order: milestone.order || (index + 1) * 10
        };
      });
      
    } catch (error) {
      console.error("Error parsing milestone data:", error, generatedJsonString);
      throw new Error("Failed to parse generated milestones");
    }

    const disclaimer = "These milestones are AI-generated suggestions based on the deal information provided. They should be reviewed by qualified professionals before implementation.";
    
    return {
      milestones: milestonesData,
      dealData: {
        title: deal.title,
        type: dealType,
        business: businessName
      },
      disclaimer
    };
  } catch (error) {
    console.error("Error generating milestones:", error);
    throw error;
  }
}
