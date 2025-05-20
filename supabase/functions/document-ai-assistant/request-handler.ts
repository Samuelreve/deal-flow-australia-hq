
import { corsHeaders } from "../_shared/cors.ts";
import { verifyDealParticipant } from "../_shared/rbac.ts";
import { RequestPayload } from "./types.ts";
import { 
  handleExplainClause, 
  handleGenerateTemplate, 
  handleSummarizeDocument,
  handleExplainMilestone,
  handleSuggestNextAction,
  handleGenerateMilestones,
  handleAnalyzeDocument,
  handleSummarizeDeal,
  handleGetDealInsights
} from "./operations/index.ts";

export async function handleRequest(req: Request, openai: any): Promise<Response> {
  try {
    const { operation, content, context, dealId, userId, documentId, documentVersionId, milestoneId } = 
      await req.json() as RequestPayload & { milestoneId?: string };
    
    if (!operation || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the request details (excluding content for privacy/security)
    console.log(`Processing ${operation} request for user ${userId}`);

    // For operation that doesn't need a specific deal, skip verification
    if (operation !== 'get_deal_insights') {
      if (!dealId) {
        return new Response(
          JSON.stringify({ error: "Missing required dealId" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Verify the user is a participant in the deal
      try {
        await verifyDealParticipant(userId, dealId);
      } catch (error) {
        console.error("Authorization error:", error);
        return new Response(
          JSON.stringify({ error: "Authorization error", details: error.message }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let result;
    switch (operation) {
      case "explain_clause":
        result = await handleExplainClause(content, context, openai);
        break;
      case "generate_template":
        const templateType = context?.templateType || "Agreement";
        result = await handleGenerateTemplate(content, dealId, userId, templateType, context, openai);
        break;
      case "summarize_document":
        result = await handleSummarizeDocument(content, dealId, documentId, documentVersionId, openai);
        break;
      case "explain_milestone":
        result = await handleExplainMilestone(dealId, milestoneId as string, openai);
        break;
      case "suggest_next_action":
        result = await handleSuggestNextAction(dealId, openai);
        break;
      case "generate_milestones":
        result = await handleGenerateMilestones(dealId, userId, context, openai);
        break;
      case "analyze_document":
        result = await handleAnalyzeDocument(dealId, documentId, documentVersionId, context?.analysisType || "general", openai);
        break;
      case "summarize_deal":
        result = await handleSummarizeDeal(dealId, openai);
        break;
      case "get_deal_insights":
        result = await handleGetDealInsights(userId, openai);
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid operation type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error processing document AI request:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process request", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}
