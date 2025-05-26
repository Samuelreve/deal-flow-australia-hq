
// Export all operation handlers
export { handleExplainClause } from './explain-clause.ts';
export { handleGenerateTemplate } from './generate-template.ts';
export { handleSummarizeDocument } from './summarize-document.ts';
export { handleExplainMilestone } from './explain-milestone.ts';
export { handleSuggestNextAction } from './suggest-next-action.ts';
export { handleGenerateMilestones } from './generate-milestones.ts';
export { handleAnalyzeDocument } from './analyze-document.ts';
export { handleSummarizeDeal } from './summarize-deal.ts';
export { handleGetDealInsights } from './get-deal-insights.ts';
export { handleDealChatQuery } from './deal-chat-query.ts';
export { handlePredictDealHealth } from './predict-deal-health.ts';

// Contract-specific operations
export { explainContractClauseOperation, handleExplainContractClause } from './explain-contract-clause.ts';
export { summarizeContractOperation, handleSummarizeContract } from './summarize-contract.ts';
