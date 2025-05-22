
import {
  handleExplainClause,
  handleGenerateTemplate,
  handleGenerateSmartTemplate,
  handleSummarizeDocument,
  handleExplainMilestone,
  handleSuggestNextAction,
  handleGenerateMilestones,
  handleAnalyzeDocument,
  handleSummarizeVersionChanges,
  handleDealChatQuery,
  handleGetDealInsights,
  handlePredictDealHealth,
  handleSummarizeDeal,
  handleExplainContractClause,
  analyzeSmartContract,
  explainSmartContractClause,
  summarizeSmartContract,
  initializeOpenAI
} from "./operations/index.ts";

/**
 * Handle the AI assistant request based on the operation
 */
export async function handleRequest(
  operation: string, 
  content: string,
  dealId: string,
  userId: string,
  documentId?: string,
  documentVersionId?: string,
  currentVersionId?: string,
  previousVersionId?: string,
  milestoneId?: string,
  context?: Record<string, any>
) {
  // Initialize OpenAI client
  const openai = initializeOpenAI();
  
  // Route the request based on the operation
  switch (operation) {
    case "explain_clause":
      return await handleExplainClause(content, documentId!, documentVersionId!, openai);
      
    case "generate_template":
      return await handleGenerateTemplate(content, dealId, userId, context?.documentType || "contract", context, openai);
      
    case "generate_smart_template":
      return await handleGenerateSmartTemplate(content, dealId, userId, context?.documentType || "contract", context, openai);
      
    case "summarize_document":
      return await handleSummarizeDocument(documentId!, documentVersionId!, openai);
      
    case "explain_milestone":
      return await handleExplainMilestone(milestoneId!, dealId, openai);
      
    case "suggest_next_action":
      return await handleSuggestNextAction(dealId, openai);
      
    case "generate_milestones":
      return await handleGenerateMilestones(dealId, content, userId, openai);
      
    case "analyze_document":
      return await handleAnalyzeDocument(documentId!, documentVersionId!, content, openai);
      
    case "summarize_version_changes":
      return await handleSummarizeVersionChanges(documentId!, currentVersionId!, previousVersionId!, openai);
      
    case "deal_chat_query":
      return await handleDealChatQuery(content, dealId, userId, context, openai);
      
    case "get_deal_insights":
      return await handleGetDealInsights(dealId, openai);
      
    case "predict_deal_health":
      return await handlePredictDealHealth(dealId, openai);
      
    case "summarize_deal":
      return await handleSummarizeDeal(dealId, openai);
      
    case "explain_contract_clause":
      return await handleExplainContractClause(content, documentId!, documentVersionId!, openai);
      
    case "analyze_smart_contract":
      return await analyzeSmartContract(documentId!, documentVersionId!, content, openai);
      
    case "explain_smart_contract_clause":
      return await explainSmartContractClause(documentId!, documentVersionId!, content, openai);
      
    case "summarize_smart_contract":
      return await summarizeSmartContract(documentId!, documentVersionId!, openai);
      
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
