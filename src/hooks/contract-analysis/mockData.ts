
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

// Mock document metadata
export const mockDocumentMetadata = {
  id: "mock-contract-1",
  name: "Sample_NDA_Contract.pdf",
  size: 156789,
  type: "application/pdf",
  uploadedAt: new Date().toISOString(),
  version: "v1.0",
  versionDate: new Date().toLocaleDateString(),
  status: "analyzed" as const
};

// Sample contract text
export const sampleContractText = `
MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of June 1, 2023 (the "Effective Date") by and between Company A, located at 123 Business Ave, City, State ("Company A"), and Company B, located at 456 Corporate Blvd, Town, State ("Company B").

1. PURPOSE
The parties wish to explore a potential business opportunity of mutual interest and in connection with this opportunity, each party may disclose to the other certain confidential technical and business information that the disclosing party desires the receiving party to treat as confidential.

2. CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by either party to the other party, either directly or indirectly, in writing, orally or by inspection of tangible objects, which is designated as "Confidential," "Proprietary" or some similar designation, or information which by its nature would be understood by a reasonable person to be confidential or proprietary.

3. TERM
This Agreement shall remain in effect for a period of 3 years from the Effective Date. The confidentiality obligations set forth in this Agreement shall survive termination of this Agreement for a period of 5 years.

4. TERMINATION
Either party may terminate this Agreement upon thirty (30) days prior written notice to the other party. All sections of this Agreement relating to the rights and obligations of the parties concerning Confidential Information disclosed during the term of the Agreement shall survive any such termination.

5. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law principles. Any disputes arising out of or related to this Agreement shall be resolved in the courts of New York County, New York.

6. REMEDIES
The receiving party agrees that any violation or threatened violation of this Agreement may cause irreparable injury to the disclosing party, entitling the disclosing party to seek injunctive relief in addition to all legal remedies.

7. AMENDMENTS
This Agreement may not be amended except by a written agreement signed by authorized representatives of both parties.

8. INTELLECTUAL PROPERTY RIGHTS
Nothing in this Agreement is intended to grant any rights to either party under any patent, copyright, trade secret or other intellectual property right of the other party.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the Effective Date.

COMPANY A                             COMPANY B
By: _________________                By: _________________
Name: John Smith                      Name: Jane Doe
Title: CEO                            Title: CTO
Date: June 1, 2023                    Date: June 1, 2023
`;

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
