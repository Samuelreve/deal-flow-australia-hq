
import { handleExplainClause } from "./explain-clause.ts";
import { handleGenerateTemplate, handleGenerateSmartTemplate } from "./generate-template.ts";
import { handleSummarizeDocument } from "./summarize-document.ts";
import { handleExplainMilestone } from "./explain-milestone.ts";
import { handleSuggestNextAction } from "./suggest-next-action.ts";
import { handleGenerateMilestones } from "./generate-milestones.ts";
import { handleAnalyzeDocument } from "./analyze-document.ts";
import { handleSummarizeVersionChanges } from "./summarize-version-changes.ts";
import { handleDealChatQuery } from "./deal-chat-query.ts";
import { handleGetDealInsights } from "./get-deal-insights.ts";
import { handlePredictDealHealth } from "./predict-deal-health.ts";
import { handleSummarizeDeal } from "./summarize-deal.ts";
import { handleExplainContractClause } from "./explain-contract-clause.ts";
import { analyzeSmartContract, explainSmartContractClause, summarizeSmartContract } from "./smart-contract-operations.ts";
import { OpenAI } from "https://esm.sh/openai@4.0.0/index.js";

export {
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
  summarizeSmartContract
};

// Helper function to initialize OpenAI
export const initializeOpenAI = () => {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }
  
  return new OpenAI({ apiKey });
};
