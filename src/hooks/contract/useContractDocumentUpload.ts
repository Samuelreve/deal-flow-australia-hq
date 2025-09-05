
import { useState } from 'react';
import { toast } from 'sonner';
import { DocumentMetadata } from '@/types/contract';
import { DocumentTextExtractionService } from '@/services/documentTextExtraction';

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

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = 'File size must be under 10MB';
      setError(errorMsg);
      onUploadError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validate file type using the extraction service
    if (!DocumentTextExtractionService.isSupportedFileType(file)) {
      const errorMsg = DocumentTextExtractionService.getUnsupportedFileTypeMessage(file);
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
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 10;
        });
      }, 200);

      // Extract real text from the uploaded file
      const extractionResult = await DocumentTextExtractionService.extractTextFromFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(90);

      if (!extractionResult.success) {
        throw new Error(extractionResult.error || 'Failed to extract text from document');
      }

      const extractedText = extractionResult.text || '';
      
      // Analyze the extracted text to determine document type
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

      // Generate analysis summary based on extracted content
      let summary;
      
      if (documentCategory === 'CONTRACT') {
        const contractDetails = analyzeContractContent(extractedText);
        summary = {
          title: '✅ Contract Successfully Analyzed',
          category: 'CONTRACT',
          contractType: contractDetails.contractType,
          parties: contractDetails.parties,
          keyTerms: contractDetails.keyTerms,
          keyPoints: [
            `• Document Type: ${contractDetails.contractType}`,
            `• Parties Involved: ${contractDetails.parties}`,
            `• Key Terms: ${contractDetails.keyTerms.slice(0, 3).join(', ')}${contractDetails.keyTerms.length > 3 ? '...' : ''}`,
            `• Text Length: ${extractedText.length} characters`,
            `• Analysis Status: Ready for Q&A`
          ],
          analysisDate: new Date().toISOString(),
          confidence: 0.95,
          message: "✅ Contract successfully uploaded and analyzed. You can now ask detailed questions about this document!"
        };
        
        toast.success('Contract analyzed successfully!', {
          description: '✅ Ready to answer questions about this contract.'
        });
      } else if (documentCategory === 'LEGAL') {
        summary = {
          title: '✅ Legal Document Analyzed',
          category: 'LEGAL',
          message: "✅ This appears to be a legal document. The AI can help explain terms and clauses.",
          keyPoints: [
            'Legal document detected and processed',
            `Text length: ${extractedText.length} characters`,
            'Ready for legal analysis and Q&A',
            'Can explain complex legal terms'
          ],
          analysisDate: new Date().toISOString()
        };
        
        toast.success('Legal document processed', {
          description: 'Ready for legal analysis and questions'
        });
      } else {
        summary = {
          title: '⚠️ Document processed but may not be a contract',
          category: 'OTHER',
          message: "⚠️ This document has been processed, but it may not be a legal contract. The AI can still help with general document analysis.",
          keyPoints: [
            'Document processed successfully',
            `Text length: ${extractedText.length} characters`,
            'Content available for general analysis',
            'Consider uploading a legal contract for specialized analysis'
          ],
          analysisDate: new Date().toISOString()
        };
        
        toast.warning('Document processed', {
          description: 'May not be a legal contract, but available for analysis'
        });
      }

      setUploadProgress(100);

      // Call success callback with real extracted content
      onUploadSuccess(metadata, extractedText, summary);

    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Failed to process document';
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

  // Helper function to categorize document based on content
  const categorizeDocument = (text: string): 'CONTRACT' | 'LEGAL' | 'OTHER' => {
    const lowerText = text.toLowerCase();
    
    // Contract indicators
    const contractKeywords = [
      'agreement', 'contract', 'party', 'parties', 'hereby', 'whereas', 'undertake',
      'obligations', 'terms and conditions', 'shall', 'covenant', 'binding',
      'executed', 'effective date', 'termination', 'breach', 'governing law'
    ];
    
    // Legal document indicators
    const legalKeywords = [
      'legal', 'court', 'jurisdiction', 'statute', 'regulation', 'law',
      'attorney', 'counsel', 'litigation', 'clause', 'provision'
    ];
    
    const contractMatches = contractKeywords.filter(keyword => lowerText.includes(keyword)).length;
    const legalMatches = legalKeywords.filter(keyword => lowerText.includes(keyword)).length;
    
    if (contractMatches >= 3) return 'CONTRACT';
    if (legalMatches >= 2) return 'LEGAL';
    return 'OTHER';
  };

  // Helper function to analyze contract content
  const analyzeContractContent = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Determine contract type
    let contractType = "Legal Agreement";
    if (lowerText.includes('non-disclosure') || lowerText.includes('nda')) {
      contractType = "Non-Disclosure Agreement";
    } else if (lowerText.includes('employment')) {
      contractType = "Employment Agreement";
    } else if (lowerText.includes('lease') || lowerText.includes('rental')) {
      contractType = "Lease Agreement";
    } else if (lowerText.includes('purchase') || lowerText.includes('sale')) {
      contractType = "Purchase/Sale Agreement";
    } else if (lowerText.includes('service')) {
      contractType = "Service Agreement";
    }
    
    // Extract parties (simplified)
    let parties = "Parties not clearly identified";
    const partyPatterns = [
      /between\s+([^,\n]+)\s+and\s+([^,\n]+)/i,
      /party\s*:\s*([^\n]+)/gi
    ];
    
    for (const pattern of partyPatterns) {
      const match = text.match(pattern);
      if (match) {
        parties = match[1] + (match[2] ? ` and ${match[2]}` : '');
        break;
      }
    }
    
    // Extract key terms
    const keyTerms = [];
    if (lowerText.includes('confidential')) keyTerms.push('Confidentiality obligations');
    if (lowerText.includes('payment') || lowerText.includes('fee')) keyTerms.push('Payment terms');
    if (lowerText.includes('termination')) keyTerms.push('Termination conditions');
    if (lowerText.includes('liability')) keyTerms.push('Liability provisions');
    if (lowerText.includes('intellectual property')) keyTerms.push('Intellectual property rights');
    
    return {
      contractType,
      parties: parties.substring(0, 100), // Limit length
      keyTerms: keyTerms.length > 0 ? keyTerms : ['Standard contractual terms']
    };
  };

  return {
    isUploading,
    uploadProgress,
    error,
    handleFileUpload
  };
};
