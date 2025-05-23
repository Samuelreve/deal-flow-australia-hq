
import { SummaryItem } from '@/components/contract/tabs/ContractSummaryTab';

// Mock data for contract summary
export interface MockSummary {
  summary: SummaryItem[];
  disclaimer: string;
}

export const mockSummaryData: MockSummary = {
  summary: [
    {
      title: "Agreement Type",
      content: "Mutual Non-Disclosure Agreement (NDA)"
    },
    {
      title: "Parties",
      content: "Company A and Company B"
    },
    {
      title: "Effective Date",
      content: "June 1, 2023"
    },
    {
      title: "Term",
      content: "3 years from Effective Date, with confidentiality obligations surviving for 5 years after termination"
    },
    {
      title: "Confidentiality Scope",
      content: "Covers any information disclosed that is designated as confidential or would be understood by a reasonable person to be confidential"
    },
    {
      title: "Governing Law",
      content: "State of New York"
    },
    {
      title: "Termination",
      content: "30 days prior written notice required"
    }
  ],
  disclaimer: "This is an AI-generated summary and may not cover all legal details. Always consult with a legal professional before making decisions based on this information."
};

// Mock contract analysis responses for different analysis types
export const mockAnalysisResponses = {
  summary: {
    answer: "This is a comprehensive contract summary analyzing the main terms, parties involved, and key obligations. The contract establishes a mutual non-disclosure agreement between two companies with specific confidentiality requirements and a 3-year term.",
    sources: ["Section 1", "Section 3"]
  },
  risks: {
    answer: "Key risks identified:\n• Broad definition of confidential information could lead to disputes\n• 5-year post-termination confidentiality period may be excessive\n• Limited remedies specified for breach\n• No specific carve-outs for independently developed information",
    sources: ["Section 2", "Section 3", "Section 6"]
  },
  keyTerms: {
    answer: "Key terms and clauses:\n• Effective Date: June 1, 2023\n• Term: 3 years with 5-year survival for confidentiality\n• Governing Law: State of New York\n• Termination: 30 days written notice\n• Remedies: Injunctive relief available\n• No IP rights granted",
    sources: ["Section 3", "Section 5", "Section 8"]
  },
  suggestions: {
    answer: "Recommendations for improvement:\n• Add specific carve-outs for publicly available information\n• Include return/destruction of confidential information clause\n• Consider reducing post-termination confidentiality period\n• Add dispute resolution mechanism\n• Clarify what constitutes 'reasonable person' standard",
    sources: ["Section 2", "Section 3"]
  }
};

// Mock question & answer history
export const mockQuestionHistory = [
  {
    id: "q1",
    question: "What is the effective date of this contract?",
    answer: {
      answer: "The effective date of this contract is June 1, 2023, as specified in the opening paragraph.",
      sources: ["Paragraph 1"]
    },
    timestamp: new Date(2023, 5, 15, 14, 30)
  },
  {
    id: "q2",
    question: "How long does the confidentiality obligation last?",
    answer: {
      answer: "The confidentiality obligations survive for 5 years after termination of the agreement, which itself has a term of 3 years from the effective date.",
      sources: ["Section 3"]
    },
    timestamp: new Date(2023, 5, 15, 14, 35)
  }
];
