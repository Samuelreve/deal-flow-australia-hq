
export const mockDocumentMetadata = {
  id: 'demo-mutual-nda-001',
  name: 'Mutual Non-Disclosure Agreement',
  type: 'Contract',
  uploadDate: new Date().toISOString(),
  status: 'completed' as const,
  version: '1.0',
  versionDate: new Date().toISOString(),
  size: 15420,
  category: 'Legal Agreement'
};

export const mockSummaryData = {
  summary: `This Mutual Non-Disclosure Agreement establishes confidentiality obligations between Company A and Company B for a potential business opportunity. 

**Key Points:**
• **Parties:** Company A (123 Business Ave) and Company B (456 Corporate Blvd)
• **Effective Date:** June 1, 2023
• **Term:** 3 years with 5-year survival clause for confidentiality obligations
• **Governing Law:** New York State
• **Termination:** 30 days written notice

**Critical Provisions:**
• Broad definition of "Confidential Information" including technical and business data
• Mutual obligations apply to both parties equally
• Remedy includes injunctive relief for violations
• No intellectual property rights granted under this agreement

**Recommendations:**
• Consider adding specific carve-outs for publicly available information
• Review termination procedures for clarity
• Ensure compliance with applicable data privacy laws`,
  
  keyTerms: [
    {
      term: "Confidential Information",
      definition: "Any information disclosed by either party, designated as confidential or proprietary, or reasonably understood to be confidential",
      location: "Section 2",
      importance: "high"
    },
    {
      term: "Term Duration",
      definition: "3 years from effective date with 5-year survival for confidentiality obligations",
      location: "Section 3",
      importance: "medium"
    },
    {
      term: "Governing Law",
      definition: "Laws of the State of New York without regard to conflict of law principles",
      location: "Section 5",
      importance: "medium"
    }
  ],
  
  riskAssessment: {
    overallRisk: "Low-Medium",
    risks: [
      {
        type: "Legal Risk",
        level: "Medium",
        description: "Broad definition of confidential information may lead to disputes over what constitutes confidential material",
        mitigation: "Consider adding specific examples or exclusions"
      },
      {
        type: "Operational Risk", 
        level: "Low",
        description: "30-day termination notice may not provide adequate transition time",
        mitigation: "Evaluate if longer notice period is needed for your business"
      },
      {
        type: "Compliance Risk",
        level: "Low", 
        description: "Agreement doesn't explicitly address data privacy law compliance",
        mitigation: "Consider adding GDPR/CCPA compliance clause if applicable"
      }
    ]
  },
  
  obligations: {
    companyA: [
      "Maintain confidentiality of Company B's information for 5 years post-termination",
      "Use confidential information solely for evaluation of business opportunity",
      "Return or destroy confidential materials upon request or termination"
    ],
    companyB: [
      "Maintain confidentiality of Company A's information for 5 years post-termination", 
      "Use confidential information solely for evaluation of business opportunity",
      "Return or destroy confidential materials upon request or termination"
    ]
  },
  
  financialTerms: {
    costs: "No monetary obligations specified",
    damages: "Parties may seek injunctive relief and legal remedies for breaches",
    currency: "USD (implied for legal costs)"
  }
};

export const mockQuestionHistory = [
  {
    id: '1',
    question: 'What is the duration of this agreement?',
    answer: {
      answer: 'This Mutual Non-Disclosure Agreement has a **3-year term** from the effective date of June 1, 2023. However, the confidentiality obligations survive termination and continue for an additional **5 years** after the agreement ends.\n\nThis means:\n• The agreement itself expires on June 1, 2026\n• Confidentiality duties continue until June 1, 2031\n• Either party can terminate with 30 days written notice',
      sources: ['Section 3 - Term', 'Section 4 - Termination']
    },
    timestamp: Date.now() - 3600000,
    type: 'question' as const
  },
  {
    id: '2', 
    question: 'Who are the parties to this agreement?',
    answer: {
      answer: 'The parties to this Mutual Non-Disclosure Agreement are:\n\n**Company A**\n• Location: 123 Business Ave, City, State\n• Representative: John Smith, CEO\n• Signed: June 1, 2023\n\n**Company B**\n• Location: 456 Corporate Blvd, Town, State  \n• Representative: Jane Doe, CTO\n• Signed: June 1, 2023\n\nBoth parties have equal rights and obligations under this mutual agreement.',
      sources: ['Header section', 'Signature block']
    },
    timestamp: Date.now() - 7200000,
    type: 'question' as const
  },
  {
    id: '3',
    question: 'What happens if confidential information is disclosed improperly?',
    answer: {
      answer: 'If confidential information is disclosed improperly, the agreement provides for significant remedies:\n\n**Immediate Relief:**\n• The disclosing party can seek **injunctive relief** to stop further disclosure\n• No need to prove monetary damages first\n\n**Legal Remedies:**\n• All available legal remedies remain available\n• May include monetary damages if provable\n• Attorney fees and court costs may be recoverable\n\n**Standard Applied:**\n• Breach may cause "irreparable injury" to the disclosing party\n• This language strengthens the case for emergency court orders\n\nThe agreement emphasizes quick action to prevent further harm rather than just monetary compensation after the fact.',
      sources: ['Section 6 - Remedies']
    },
    timestamp: Date.now() - 10800000,
    type: 'question' as const
  }
];

export const sampleContractText = `
MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of June 1, 2023 (the "Effective Date") by and between Company A, a corporation organized under the laws of Delaware, located at 123 Business Ave, City, State 12345 ("Company A"), and Company B, a limited liability company organized under the laws of California, located at 456 Corporate Blvd, Town, State 67890 ("Company B").

RECITALS

WHEREAS, the parties wish to explore a potential business opportunity of mutual interest including but not limited to strategic partnerships, joint ventures, licensing arrangements, or acquisition discussions (the "Purpose");

WHEREAS, in connection with this opportunity, each party may disclose to the other certain confidential technical and business information that the disclosing party desires the receiving party to treat as confidential;

NOW, THEREFORE, in consideration of the mutual covenants contained herein, the parties agree as follows:

1. PURPOSE
The parties wish to explore the Purpose described above. This Agreement governs the disclosure and use of confidential information exchanged during these discussions.

2. CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by either party to the other party, either directly or indirectly, in writing, orally, electronically, or by inspection of tangible objects, including but not limited to:
(a) Technical data, research, product plans, products, services, customers, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances;
(b) Business information such as financial data, sales figures, strategic plans, pricing information, cost data, market studies;
(c) Any other information that is designated as "Confidential," "Proprietary" or some similar designation; or
(d) Information which by its nature would be understood by a reasonable person to be confidential or proprietary.

Confidential Information shall not include information that:
(i) Is or becomes publicly available through no breach of this Agreement;
(ii) Is rightfully received from a third party without breach of any confidentiality obligation;
(iii) Is independently developed without use of Confidential Information; or
(iv) Is required to be disclosed by law or court order.

3. TERM
This Agreement shall remain in effect for a period of 3 years from the Effective Date, unless earlier terminated in accordance with Section 4. The confidentiality obligations set forth in this Agreement shall survive termination of this Agreement for a period of 5 years from the date of termination.

4. TERMINATION
Either party may terminate this Agreement upon thirty (30) days prior written notice to the other party. All sections of this Agreement relating to the rights and obligations of the parties concerning Confidential Information disclosed during the term of the Agreement shall survive any such termination.

5. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law principles. Any disputes arising out of or related to this Agreement shall be resolved exclusively in the state and federal courts located in New York County, New York, and the parties consent to the jurisdiction of such courts.

6. REMEDIES
The receiving party acknowledges that any violation or threatened violation of this Agreement may cause irreparable injury to the disclosing party, entitling the disclosing party to seek injunctive relief in addition to all legal remedies available at law or equity, without the necessity of proving actual damages.

7. AMENDMENTS
This Agreement may not be amended except by a written agreement signed by authorized representatives of both parties.

8. INTELLECTUAL PROPERTY RIGHTS
Nothing in this Agreement is intended to grant any rights to either party under any patent, copyright, trademark, trade secret or other intellectual property right of the other party, nor shall this Agreement grant any party any rights in or to the Confidential Information of the other party except as expressly set forth herein.

9. NON-SOLICITATION
During the term of this Agreement and for a period of one (1) year thereafter, each party agrees not to directly solicit for employment any employee of the other party who has had access to Confidential Information under this Agreement.

10. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior and contemporaneous understandings, agreements, representations and warranties.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the Effective Date.

COMPANY A                             COMPANY B

By: /s/ John Smith                    By: /s/ Jane Doe
Name: John Smith                      Name: Jane Doe  
Title: Chief Executive Officer        Title: Chief Technology Officer
Date: June 1, 2023                    Date: June 1, 2023

EXHIBIT A - CONTACT INFORMATION

Company A Contacts:
Primary: John Smith, CEO (john.smith@companya.com)
Legal: Sarah Johnson, Legal Counsel (legal@companya.com)

Company B Contacts:  
Primary: Jane Doe, CTO (jane.doe@companyb.com)
Legal: Michael Brown, General Counsel (legal@companyb.com)
`;
