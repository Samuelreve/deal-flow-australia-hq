
// Add new contract-related types

export interface ContractSummaryResponse {
  summaryText: string;
  contractType?: string;
  parties?: string[];
  keyObligations?: string[];
  timelines?: string[];
  terminationRules?: string[];
  liabilities?: string[];
  disclaimer: string;
  success?: boolean;
}

export interface ContractClauseExplanationResponse {
  explanation: string;
  isAmbiguous?: boolean;
  ambiguityExplanation?: string;
  disclaimer: string;
  success?: boolean;
}
