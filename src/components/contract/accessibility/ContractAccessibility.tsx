
import React from 'react';

// Accessibility utilities for contract components
export const contractAriaLabels = {
  uploadArea: "Contract upload area - drag and drop files here or click to browse",
  contractList: "List of uploaded contracts",
  contractItem: (name: string, status: string) => `Contract ${name}, status: ${status}`,
  analysisTab: (type: string) => `Contract analysis tab: ${type}`,
  questionInput: "Ask a question about the contract",
  highlightTool: "Highlight text in the contract document",
  contractViewer: "Contract document viewer",
  loadingAnalysis: "Contract analysis in progress",
  errorMessage: "Error message",
  retryButton: "Retry the failed operation"
};
