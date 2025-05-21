
import { FileText, ChevronRight, AlertCircle } from "lucide-react";
import React from "react";

export interface AnalysisType {
  id: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

export const ANALYSIS_TYPES: AnalysisType[] = [
  { id: 'summarize_contract', label: 'Contract Summary', icon: React.createElement(FileText, { className: "h-4 w-4" }) },
  { id: 'key_clauses', label: 'Key Clauses', description: 'Extract important clauses from the document' },
  { id: 'risk_identification', label: 'Risk Analysis', description: 'Identify potential risks in the document' },
  { id: 'legal_compliance', label: 'Legal Compliance', description: 'Check for compliance considerations' },
  { id: 'obligations_analysis', label: 'Obligations', description: 'Extract obligations and commitments' },
];

export const getAnalysisLabel = (analysisType: string): string => {
  const found = ANALYSIS_TYPES.find(type => type.id === analysisType);
  return found ? found.label : 'Analysis';
};
