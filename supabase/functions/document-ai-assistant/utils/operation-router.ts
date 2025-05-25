
import { RequestPayload } from "../types.ts";
import { 
  handleExplainClause, 
  handleGenerateTemplate, 
  handleSummarizeDocument,
  handleExplainMilestone,
  handleSuggestNextAction,
  handleGenerateMilestones,
  handleAnalyzeDocument,
  handleSummarizeDeal,
  handleGetDealInsights,
  handleDealChatQuery,
  handlePredictDealHealth,
  handleSummarizeContract,
  handleExplainContractClause
} from "../operations/index.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

/**
 * Route the request to the appropriate handler based on the operation type
 */
export async function routeOperation(payload: RequestPayload, openai: any): Promise<Record<string, any>> {
  const { 
    operation, 
    content, 
    context, 
    dealId, 
    userId, 
    documentId, 
    documentVersionId, 
    milestoneId,
    chatHistory = [],
    selectedText = ""
  } = payload;

  // Create supabase client for operations that need it
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  switch (operation) {
    case "explain_clause":
      return await handleExplainContractClause(dealId!, userId, content, null);
    case "generate_template":
      const templateType = context?.templateType || "Agreement";
      return await handleGenerateTemplate(content, dealId!, userId, templateType, context, null);
    case "summarize_document":
      return await handleSummarizeDocument(content, dealId!, documentId!, documentVersionId!, null);
    case "explain_milestone":
      return await handleExplainMilestone(dealId!, milestoneId as string, null);
    case "suggest_next_action":
      return await handleSuggestNextAction(dealId!, null);
    case "generate_milestones":
      return await handleGenerateMilestones(dealId!, userId, context, null);
    case "analyze_document":
      return await handleAnalyzeDocument(dealId!, documentId!, documentVersionId!, context?.analysisType || "general", null);
    case "summarize_deal":
      return await handleSummarizeDeal(dealId!, null);
    case "get_deal_insights":
      return await handleGetDealInsights(userId, null);
    case "deal_chat_query":
      return await handleDealChatQuery(dealId!, content, null, supabase);
    case "predict_deal_health":
      return await handlePredictDealHealth(dealId!, userId, null);
    case "summarize_contract":
      return await handleSummarizeContract(dealId!, documentId!, documentVersionId!, userId, null);
    case "explain_contract_clause":
      return await handleExplainContractClause(dealId!, userId, selectedText || content, null);
    default:
      throw new Error("Invalid operation type");
  }
}
