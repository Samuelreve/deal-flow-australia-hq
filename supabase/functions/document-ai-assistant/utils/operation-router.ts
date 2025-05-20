
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
  handleDealChatQuery
} from "../operations/index.ts";

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
    chatHistory = []
  } = payload;

  switch (operation) {
    case "explain_clause":
      return await handleExplainClause(content, context, openai);
    case "generate_template":
      const templateType = context?.templateType || "Agreement";
      return await handleGenerateTemplate(content, dealId, userId, templateType, context, openai);
    case "summarize_document":
      return await handleSummarizeDocument(content, dealId, documentId, documentVersionId, openai);
    case "explain_milestone":
      return await handleExplainMilestone(dealId, milestoneId as string, openai);
    case "suggest_next_action":
      return await handleSuggestNextAction(dealId, openai);
    case "generate_milestones":
      return await handleGenerateMilestones(dealId, userId, context, openai);
    case "analyze_document":
      return await handleAnalyzeDocument(dealId, documentId, documentVersionId, context?.analysisType || "general", openai);
    case "summarize_deal":
      return await handleSummarizeDeal(dealId, openai);
    case "get_deal_insights":
      return await handleGetDealInsights(userId, openai);
    case "deal_chat_query":
      return await handleDealChatQuery(dealId, userId, content, chatHistory, openai);
    default:
      throw new Error("Invalid operation type");
  }
}
