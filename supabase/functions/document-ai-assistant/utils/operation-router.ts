
import { RequestPayload } from "../types.ts";
import { handleExplainClause } from "../operations/explain-clause.ts";
import { handleExplainMilestone } from "../operations/explain-milestone.ts";
import { handleSuggestNextAction } from "../operations/suggest-next-action.ts";
import { handleGenerateMilestones } from "../operations/generate-milestones.ts";
import { handleGenerateTemplate } from "../operations/generate-template.ts";
import { handleAnalyzeDocument } from "../operations/analyze-document.ts";
import { handleSummarizeDocument } from "../operations/summarize-document.ts";
import { handleSummarizeVersionChanges } from "../operations/summarize-version-changes.ts";
import { handlePredictDealHealth } from "../operations/predict-deal-health.ts";
import { handleDealChatQuery } from "../operations/deal-chat-query.ts";

export async function routeOperation(payload: RequestPayload, openai: any) {
  switch (payload.operation) {
    case 'explain_clause':
      return await handleExplainClause(payload.content, openai);
    
    case 'explain_milestone':
      return await handleExplainMilestone(payload.dealId!, payload.milestoneId!, openai);
    
    case 'suggest_next_action':
      return await handleSuggestNextAction(payload.dealId!, openai);
    
    case 'generate_milestones':
      return await handleGenerateMilestones(payload.dealId!, payload.userId!, payload.context, openai);
    
    case 'generate_template':
      return await handleGenerateTemplate(
        payload.content!,
        payload.dealId!,
        payload.userId!,
        payload.context?.templateType || 'Contract',
        payload.context,
        openai
      );
    
    case 'analyze_document':
      return await handleAnalyzeDocument(
        payload.documentId!,
        payload.documentVersionId!,
        payload.context!.analysisType,
        openai
      );
    
    case 'summarize_document':
      return await handleSummarizeDocument(
        payload.content, 
        {
          ...payload.context,
          documentId: payload.documentId,
          documentVersionId: payload.documentVersionId
        }, 
        openai
      );
    
    case 'summarize_version_changes':
      return await handleSummarizeVersionChanges(
        payload.currentVersionId!,
        payload.previousVersionId!,
        openai
      );
    
    case 'predict_deal_health':
      return await handlePredictDealHealth(payload.dealId!, payload.userId!, openai);
    
    case 'deal_chat_query':
      return await handleDealChatQuery(
        payload.dealId!,
        payload.userId!,
        payload.content!,
        payload.chatHistory || [],
        openai
      );
    
    default:
      throw new Error('Invalid operation type');
  }
}
