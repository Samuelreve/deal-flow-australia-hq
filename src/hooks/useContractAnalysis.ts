
import { useState } from 'react';
import { toast } from 'sonner';

export interface DocumentMetadata {
  name: string;
  type: string;
  uploadDate: string;
  status: string;
  version: string;
  versionDate: string;
}

export interface SummaryItem {
  title: string;
  content: string;
}

export interface SummaryData {
  summary: SummaryItem[];
  disclaimer: string;
}

// Mock AI responses for common questions
const mockAnswers: Record<string, string> = {
  "what is the duration": "This Agreement remains in effect for a period of 3 years from the Effective Date, unless terminated earlier by mutual written agreement, as specified in Section 3.",
  "what happens if confidentiality is breached": "According to Section 7 (Remedies), the Disclosing Party is entitled to seek appropriate equitable relief, including injunction and specific performance, in addition to any other remedies available at law, as unauthorized disclosure could cause substantial harm for which damages alone may not be sufficient.",
  "who are the parties": "The parties to this agreement are ABC Corp., a Delaware corporation with its principal place of business at 123 Main St, San Francisco, CA 94105, and XYZ, Inc., a California corporation with its principal place of business at 456 Market St, San Francisco, CA 94105.",
  "what law governs this agreement": "According to Section 8, this Agreement is governed by and construed in accordance with the laws of the State of California without regard to conflicts of law principles.",
  "what is considered confidential information": "As defined in Section 2, 'Confidential Information' includes technical data, trade secrets, know-how, research, product plans, products, services, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances, and other business information that is designated as confidential or should reasonably be understood to be confidential."
};

// Initial document metadata
const initialMetadata: DocumentMetadata = {
  name: "Mutual NDA - Template.pdf",
  type: "Non-Disclosure Agreement",
  uploadDate: new Date().toLocaleString(),
  status: "Analyzed",
  version: "v1",
  versionDate: "Just now"
};

// Mock default contract text
const mockContractText = `
MUTUAL NON-DISCLOSURE AGREEMENT

THIS MUTUAL NON-DISCLOSURE AGREEMENT (the "Agreement") is made and entered into as of [DATE] (the "Effective Date") by and between ABC Corp., a Delaware corporation with its principal place of business at 123 Main St, San Francisco, CA 94105 ("Company A"), and XYZ, Inc., a California corporation with its principal place of business at 456 Market St, San Francisco, CA 94105 ("Company B").

1. PURPOSE
Each party wishes to disclose certain Confidential Information to the other party for the purpose of evaluating a potential business relationship between the parties (the "Purpose").

2. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by one party (the "Disclosing Party") to the other party (the "Receiving Party"), either directly or indirectly, in writing, orally or by inspection of tangible objects, which is designated as "Confidential," "Proprietary" or some similar designation, or that should reasonably be understood to be confidential given the nature of the information and the circumstances of disclosure. Confidential Information includes, but is not limited to, technical data, trade secrets, know-how, research, product plans, products, services, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances or other business information.

3. TERM
This Agreement shall remain in effect for a period of 3 years from the Effective Date, unless terminated earlier by mutual written agreement.

4. OBLIGATIONS
The Receiving Party shall:
(a) Use the Confidential Information only for the Purpose;
(b) Restrict disclosure of Confidential Information solely to those employees or agents with a need to know such information and who are bound by confidentiality obligations no less restrictive than those contained herein;
(c) Not disclose any Confidential Information to any third party without prior written approval of the Disclosing Party;
(d) Use no less than reasonable care to protect the Disclosing Party's Confidential Information.

5. EXCLUSIONS
The obligations of the Receiving Party shall not apply to any information that:
(a) Was publicly known or made generally available without a duty of confidentiality prior to the time of disclosure;
(b) Becomes publicly known or made generally available without a duty of confidentiality after disclosure through no action or inaction of the Receiving Party;
(c) Is in the rightful possession of the Receiving Party without confidentiality obligations at the time of disclosure;
(d) Is properly obtained by the Receiving Party from a third party without restriction on disclosure; or
(e) Is independently developed by the Receiving Party without use of or reference to the Disclosing Party's Confidential Information.

6. RETURN OF MATERIALS
Upon the termination of this Agreement, or upon the Disclosing Party's request at any time, the Receiving Party shall promptly return or destroy all copies of the Disclosing Party's Confidential Information.

7. REMEDIES
The Receiving Party acknowledges that unauthorized disclosure of the Disclosing Party's Confidential Information could cause substantial harm for which damages alone may not be a sufficient remedy. Therefore, the Disclosing Party shall be entitled to seek appropriate equitable relief, including injunction and specific performance, in addition to any other remedies available at law.

8. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of California without regard to conflicts of law principles.

9. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties regarding the subject matter hereof and supersedes all prior agreements, understandings, and communications between the parties, whether written or oral.

10. MISCELLANEOUS
This Agreement may not be modified except by a written instrument signed by both parties. The failure of either party to enforce any provision of this Agreement shall not be deemed a waiver of that or any other provision.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

ABC Corp.                          XYZ, Inc.

By: ______________________         By: ______________________
Name:                              Name: 
Title:                             Title:
Date:                              Date:
`;

// Mock AI response for contract summary
const mockSummary: SummaryData = {
  summary: [
    {
      title: "What is this contract about?",
      content: "This is a Mutual Non-Disclosure Agreement (NDA) between ABC Corp. and XYZ, Inc. to protect confidential information shared during business discussions."
    },
    {
      title: "Who are the parties involved?",
      content: "ABC Corp. (a Delaware corporation) and XYZ, Inc. (a California corporation)."
    },
    {
      title: "Key terms and obligations",
      content: "Both parties must use confidential information only for evaluating a business relationship, restrict disclosure to employees with a need to know, not disclose to third parties without approval, and protect information with reasonable care."
    },
    {
      title: "Termination conditions",
      content: "The agreement lasts for 3 years from the effective date, unless terminated earlier by mutual written agreement. Upon termination or request, all confidential materials must be returned or destroyed."
    },
    {
      title: "Potential risks or red flags",
      content: "No specific risks identified, though the agreement is governed by California law which may have implications depending on your jurisdiction."
    }
  ],
  disclaimer: "This AI-generated summary is provided for informational purposes only and does not constitute legal advice. Please consult with a qualified legal professional before making decisions based on this information."
};

export const useContractAnalysis = () => {
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata>(initialMetadata);
  const [contractText, setContractText] = useState<string>(mockContractText);
  const [customSummary, setCustomSummary] = useState<SummaryData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  // Helper function to determine document type from filename
  const determineDocumentType = (filename: string): string => {
    filename = filename.toLowerCase();
    if (filename.includes("nda") || filename.includes("disclosure")) {
      return "Non-Disclosure Agreement";
    } else if (filename.includes("agreement") || filename.includes("contract")) {
      return "Business Agreement";
    } else if (filename.includes("lease")) {
      return "Lease Agreement";
    } else {
      return "Contract Document";
    }
  };
  
  // Simple function to try to extract party names from text
  const extractParties = (text: string): string => {
    // This is a very simple implementation for demo purposes
    // Real implementation would use more sophisticated NLP
    const lines = text.split('\n').slice(0, 20); // Check first 20 lines
    const partiesLine = lines.find(line => 
      line.toLowerCase().includes("between") || 
      line.toLowerCase().includes("party") ||
      line.toLowerCase().includes("agreement") && 
      (line.toLowerCase().includes("by") || line.toLowerCase().includes("and"))
    );
    
    return partiesLine || "";
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Update document metadata with the actual file information
    setDocumentMetadata({
      name: file.name,
      type: determineDocumentType(file.name),
      uploadDate: new Date().toLocaleString(),
      status: "Processing",
      version: "v1",
      versionDate: "Just now"
    });
    
    setIsAnalyzing(true);
    
    // Read file content if it's a text file for demo purposes
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string || "No content could be extracted";
        setContractText(content);
        // After text extraction, simulate AI processing
        simulateAIProcessing(content);
      };
      reader.readAsText(file);
    } else {
      // For non-text files (PDF, DOCX), just simulate processing
      simulateAIProcessing();
    }
  };
  
  // Simulate AI processing with optional content
  const simulateAIProcessing = (content?: string) => {
    // Wait 3 seconds to simulate processing
    setTimeout(() => {
      // Update status to analyzed
      setDocumentMetadata(prev => ({
        ...prev,
        status: "Analyzed"
      }));
      
      setIsAnalyzing(false);
      
      // Generate a simple custom summary if we have content
      if (content && content.length > 50) {
        const parties = extractParties(content);
        
        // Create a simplified custom summary based on extracted text
        setCustomSummary({
          summary: [
            {
              title: "What is this contract about?",
              content: `This appears to be a document with ${content.length} characters.`
            },
            {
              title: "Who are the parties involved?",
              content: parties || "Could not identify specific parties."
            },
            {
              title: "Key terms and obligations",
              content: "Document processing detected text content but detailed analysis requires AI processing."
            },
            {
              title: "Termination conditions",
              content: "Not identified in basic text processing."
            },
            {
              title: "Potential risks or red flags",
              content: "Full AI analysis required for risk assessment."
            }
          ],
          disclaimer: "This is a simplified analysis for demonstration purposes. In a production environment, the document would be analyzed by a more sophisticated AI model."
        });
      }
      
      toast.success("Contract processed successfully", {
        description: "Document processed and ready for review"
      });
    }, 3000);
  };
  
  // Handle ask question functionality
  const handleAskQuestion = async (question: string): Promise<string | null> => {
    // Simulate AI processing delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Look for keywords in the question to match to our mock answers
        const lowerQuestion = question.toLowerCase();
        let foundAnswer = null;
        
        for (const [keyword, response] of Object.entries(mockAnswers)) {
          if (lowerQuestion.includes(keyword)) {
            foundAnswer = response;
            break;
          }
        }
        
        if (foundAnswer) {
          resolve(foundAnswer);
        } else {
          resolve("I cannot find specific information about this in the contract. Please try rephrasing your question or ask about another topic covered in the agreement.");
        }
      }, 1500);
    });
  };

  return {
    documentMetadata,
    contractText,
    customSummary,
    mockSummary,
    isAnalyzing,
    handleFileUpload,
    handleAskQuestion
  };
};
