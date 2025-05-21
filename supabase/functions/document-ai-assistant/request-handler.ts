
import { corsHeaders } from "../_shared/cors.ts";
import { verifyAuth, verifyDealParticipant } from "../_shared/rbac.ts";
import { validateRequest } from "./utils/request-validation.ts";
import { 
  handleExplainClause, 
  handleExplainMilestone, 
  handleGenerateTemplate, 
  handleSuggestNextAction,
  handleSummarizeDocument, 
  handleSummarizeDeal, 
  handleGenerateMilestones,
  handleDealInsights,
  handleDealChatQuery,
  handlePredictDealHealth,
  handleAnalyzeDocument,
  handleSummarizeContract,
  handleExplainContractClause
} from "./operations/index.ts";

export async function handleRequest(req: Request, openai: any) {
  try {
    // Validate and parse the request
    const body = await req.json();
    const { operation, dealId, userId, content, documentId, documentVersionId, milestoneId, context } = 
      validateRequest(body);

    // Verify the user has access to the deal
    await verifyDealParticipant(userId, dealId);

    // Process the request based on operation type
    let result = null;

    switch (operation) {
      case "explain_clause":
        result = await handleExplainClause(content, null, openai);
        break;
      case "explain_milestone":
        result = await handleExplainMilestone(milestoneId, openai);
        break;
      case "generate_template":
        result = await handleGenerateTemplate(content, dealId, openai);
        break;
      case "summarize_document":
        result = await handleSummarizeDocument(documentId, documentVersionId, openai);
        break;
      case "summarize_deal":
        result = await handleSummarizeDeal(dealId, openai);
        break;
      case "suggest_next_action":
        result = await handleSuggestNextAction(dealId, openai);
        break;
      case "generate_milestones":
        result = await handleGenerateMilestones(dealId, content, openai);
        break;
      case "get_deal_insights":
        result = await handleDealInsights(userId, dealId, openai);
        break;
      case "deal_chat_query":
        result = await handleDealChatQuery(dealId, content, openai);
        break;
      case "predict_deal_health":
        result = await handlePredictDealHealth(dealId, openai);
        break;
      case "analyze_document":
        result = await handleAnalyzeDocument(dealId, documentId, documentVersionId, context?.analysisType, openai);
        break;
      case "summarize_contract":
        result = await handleSummarizeContract(dealId, documentId, documentVersionId, openai);
        break;
      case "explain_contract_clause":
        result = await handleExplainContractClause(content, documentId, documentVersionId, dealId, openai);
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid operation type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Return the result
    return new Response(
      JSON.stringify({ ...result, success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error handling request:", error);
    
    let status = 500;
    let message = "Internal server error";
    
    if (error.message.includes("Missing required fields")) {
      status = 400;
      message = "Missing required fields";
    } else if (error.message.includes("Authorization error")) {
      status = 403;
      message = "Authorization error";
    }
    
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
