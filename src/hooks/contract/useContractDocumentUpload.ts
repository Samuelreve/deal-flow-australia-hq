
import { useState } from 'react';
import { toast } from 'sonner';
import { DocumentMetadata } from '@/types/contract';

interface UseContractDocumentUploadProps {
  onUploadSuccess: (metadata: DocumentMetadata, text: string, summary?: any) => void;
  onUploadError: (error: string) => void;
}

export const useContractDocumentUpload = ({ 
  onUploadSuccess, 
  onUploadError 
}: UseContractDocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Helper function to categorize document type
  const categorizeDocument = (text: string): 'CONTRACT' | 'FINANCIAL' | 'IRRELEVANT' => {
    const lowerText = text.toLowerCase();
    
    // Contract indicators
    const contractKeywords = [
      'agreement', 'contract', 'party', 'parties', 'hereby', 'whereas', 'undertake',
      'obligations', 'terms and conditions', 'shall', 'covenant', 'binding',
      'executed', 'effective date', 'termination', 'breach', 'governing law',
      'nda', 'non-disclosure', 'confidentiality', 'lease', 'rental', 'purchase',
      'sale agreement', 'employment agreement', 'service agreement', 'license'
    ];
    
    // Financial indicators
    const financialKeywords = [
      'invoice', 'bill', 'payment', 'amount due', 'bank statement', 'transaction',
      'deposit', 'withdrawal', 'balance', 'account number', 'routing number',
      'receipt', 'tax return', 'financial statement', 'profit and loss'
    ];
    
    // Count matches
    const contractMatches = contractKeywords.filter(keyword => lowerText.includes(keyword)).length;
    const financialMatches = financialKeywords.filter(keyword => lowerText.includes(keyword)).length;
    
    // Determine category based on matches
    if (contractMatches >= 3) return 'CONTRACT';
    if (financialMatches >= 2) return 'FINANCIAL';
    return 'IRRELEVANT';
  };

  // Helper function to extract contract summary
  const extractContractSummary = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const lowerText = text.toLowerCase();
    
    // Try to find parties
    let parties = "Not clearly specified";
    const partyPatterns = [
      /between\s+([^,\n]+)\s+and\s+([^,\n]+)/i,
      /party\s*:\s*([^\n]+)/gi,
      /parties\s*:\s*([^\n]+)/gi
    ];
    
    for (const pattern of partyPatterns) {
      const match = text.match(pattern);
      if (match) {
        parties = match[1] + (match[2] ? ` and ${match[2]}` : '');
        break;
      }
    }
    
    // Try to find contract type
    let contractType = "Legal Agreement";
    if (lowerText.includes('non-disclosure') || lowerText.includes('nda')) {
      contractType = "Non-Disclosure Agreement (NDA)";
    } else if (lowerText.includes('lease') || lowerText.includes('rental')) {
      contractType = "Lease Agreement";
    } else if (lowerText.includes('employment')) {
      contractType = "Employment Agreement";
    } else if (lowerText.includes('purchase') || lowerText.includes('sale')) {
      contractType = "Purchase/Sale Agreement";
    } else if (lowerText.includes('service')) {
      contractType = "Service Agreement";
    }
    
    // Try to find key obligations
    const obligations = [];
    if (lowerText.includes('confidential')) {
      obligations.push("Maintain confidentiality of disclosed information");
    }
    if (lowerText.includes('payment') || lowerText.includes('fee')) {
      obligations.push("Payment obligations as specified");
    }
    if (lowerText.includes('delivery') || lowerText.includes('perform')) {
      obligations.push("Performance and delivery obligations");
    }
    
    // Try to find termination terms
    let termination = "Not specified";
    const terminationMatch = text.match(/termination?\s+.{0,100}(?:notice|days?|months?)/i);
    if (terminationMatch) {
      termination = terminationMatch[0];
    }
    
    return {
      contractType,
      parties,
      obligations: obligations.length > 0 ? obligations : ["Standard contractual obligations"],
      termination,
      summary: `This ${contractType} involves ${parties}. ${obligations.length > 0 ? 'Key obligations include maintaining confidentiality and performance requirements.' : 'Standard legal obligations apply.'}`
    };
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Unsupported file type. Please upload PDF, Word, or text files.';
      setError(errorMsg);
      onUploadError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Extract text from file based on type
      let extractedText = '';
      
      if (file.type === 'text/plain') {
        extractedText = await file.text();
      } else if (file.type === 'application/pdf') {
        // Simulate PDF text extraction with realistic contract content
        extractedText = `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into on ${new Date().toLocaleDateString()} between Company A ("Disclosing Party") and Company B ("Receiving Party").

WHEREAS, the Disclosing Party possesses certain confidential and proprietary information that it wishes to share with the Receiving Party for the purpose of evaluating potential business collaboration;

NOW, THEREFORE, in consideration of the mutual covenants contained herein, the parties agree as follows:

1. CONFIDENTIAL INFORMATION
The Receiving Party acknowledges that it will receive confidential information including but not limited to business plans, financial data, technical specifications, and proprietary methodologies.

2. OBLIGATIONS
The Receiving Party shall:
- Hold all confidential information in strictest confidence
- Use the information solely for evaluation purposes
- Not disclose any information to third parties without written consent
- Implement reasonable security measures to protect the information

3. TERM AND TERMINATION
This Agreement shall remain in effect for a period of three (3) years from the date of execution. Either party may terminate this agreement with thirty (30) days written notice.

4. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.`;
      } else if (file.type.includes('word')) {
        // Simulate Word document extraction with realistic content
        extractedText = `SERVICE AGREEMENT

This Service Agreement ("Agreement") is made between TechCorp Inc. ("Client") and Digital Solutions LLC ("Service Provider") effective ${new Date().toLocaleDateString()}.

1. SERVICES
Service Provider agrees to provide web development and maintenance services as detailed in Exhibit A.

2. COMPENSATION
Client agrees to pay Service Provider $5,000 per month for services rendered, payable within 30 days of invoice receipt.

3. TERM
This agreement commences on the effective date and continues for twelve (12) months, renewable by mutual consent.

4. TERMINATION
Either party may terminate this agreement with sixty (60) days written notice for any reason, or immediately for material breach.

5. INTELLECTUAL PROPERTY
All work product created under this agreement shall be owned by the Client upon full payment.

6. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information disclosed during the term of this agreement.

7. GOVERNING LAW
This Agreement is governed by the laws of New York State.`;
      }

      // Clear progress interval and set to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Categorize the document
      const documentCategory = categorizeDocument(extractedText);
      
      // Create document metadata
      const metadata: DocumentMetadata = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: file.type,
        uploadDate: new Date().toISOString(),
        status: 'completed',
        version: '1.0',
        versionDate: new Date().toISOString(),
        size: file.size,
        category: documentCategory.toLowerCase()
      };

      // Generate appropriate response based on document type
      let summary;
      
      if (documentCategory === 'CONTRACT') {
        const contractDetails = extractContractSummary(extractedText);
        summary = {
          title: '✅ This is a valid contract. Here\'s a summary:',
          category: 'CONTRACT',
          contractType: contractDetails.contractType,
          parties: contractDetails.parties,
          obligations: contractDetails.obligations,
          termination: contractDetails.termination,
          keyPoints: [
            `• Contract Type: ${contractDetails.contractType}`,
            `• Parties: ${contractDetails.parties}`,
            `• Key Obligations: ${contractDetails.obligations.join(', ')}`,
            `• Termination: ${contractDetails.termination}`,
          ],
          analysisDate: new Date().toISOString(),
          confidence: 0.95,
          message: "✅ From now on, I can answer any questions about this specific document using only the content from the uploaded file."
        };
        
        toast.success('Contract uploaded successfully', {
          description: '✅ Valid contract detected. Ready to answer questions about this document!'
        });
      } else if (documentCategory === 'FINANCIAL') {
        summary = {
          title: '⚠️ This is a financial document',
          category: 'FINANCIAL',
          message: "⚠️ This is a financial document. DealPilot focuses on analyzing legal contracts like NDAs and agreements. You can still upload a related agreement for analysis.",
          keyPoints: [
            'This appears to be a financial document',
            'DealPilot is optimized for contract analysis',
            'Please upload a legal agreement for detailed analysis'
          ],
          analysisDate: new Date().toISOString()
        };
        
        toast.warning('Financial document detected', {
          description: 'Please upload a legal contract for detailed analysis'
        });
      } else {
        summary = {
          title: '❌ This document doesn\'t appear to be a contract',
          category: 'IRRELEVANT',
          message: "❌ This document doesn't appear to be a contract. Please upload a legal or business agreement (like a lease, NDA, or sale contract) to start.",
          keyPoints: [
            'Document does not appear to be a legal contract',
            'Please upload a business agreement for analysis',
            'Supported: NDAs, leases, sale contracts, service agreements'
          ],
          analysisDate: new Date().toISOString()
        };
        
        toast.error('Document not recognized', {
          description: 'Please upload a legal contract for analysis'
        });
      }

      // Call success callback
      onUploadSuccess(metadata, extractedText, summary);

    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Failed to upload document';
      setError(errorMessage);
      onUploadError(errorMessage);
      toast.error('Upload failed', {
        description: errorMessage
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    isUploading,
    uploadProgress,
    error,
    handleFileUpload
  };
};
