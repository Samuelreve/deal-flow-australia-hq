
import { useState, useCallback } from 'react';
import { toast } from "sonner";

export function useContractAnalysis() {
  // Document metadata state
  const [documentMetadata, setDocumentMetadata] = useState({
    name: "Mutual NDA - Template.pdf",
    type: "PDF Document",
    uploadDate: "May 20, 2025",
    status: "Active",
    version: "1.0",
    versionDate: "May 20, 2025"
  });

  // Contract content state
  const [contractText, setContractText] = useState<string>(
    "This Mutual Non-Disclosure Agreement (this \"Agreement\") is entered into as of [Date] by and between [Company Name], with its principal offices at [Address] (\"Company\"), and [Other Party], located at [Address] (\"Recipient\").\n\n" +
    "1. Purpose. The parties wish to explore a business opportunity of mutual interest and in connection with this opportunity, each party may disclose to the other certain confidential technical and business information that the disclosing party desires the receiving party to treat as confidential.\n\n" +
    "2. \"Confidential Information\" means any information disclosed by either party to the other party, either directly or indirectly, in writing, orally or by inspection of tangible objects, including without limitation documents, prototypes, samples, plant and equipment, research, product plans, products, services, customer lists, markets, software, developments, inventions, processes, designs, drawings, engineering, hardware configuration information, marketing or finance documents, which is designated as \"Confidential,\" \"Proprietary\" or some similar designation. Information communicated orally shall be considered Confidential Information if such information is confirmed in writing as being Confidential Information within a reasonable time after the initial disclosure."
  );

  // AI analysis states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<string>("Analyzing document");
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);

  // AI-generated summary data
  const mockSummary = {
    summary: [
      { title: "Document Type", content: "Mutual Non-Disclosure Agreement (NDA)" },
      { title: "Parties Involved", content: "Company and Recipient (to be specified)" },
      { title: "Purpose", content: "Protect confidential information shared while exploring a business opportunity" },
      { title: "Key Terms", content: "Defines what constitutes confidential information, usage restrictions, term of agreement" },
      { title: "Duration", content: "Not specified in the provided excerpt" },
    ],
    disclaimer: "This analysis is provided for informational purposes only and should not be considered legal advice. Always consult with a qualified legal professional for specific advice regarding your contract."
  };

  const [customSummary, setCustomSummary] = useState<typeof mockSummary | null>(null);

  // Handle file upload and processing
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsAnalyzing(true);
      setAnalysisProgress(10);
      setAnalysisStage("Processing document...");

      // Create form data for the file
      const formData = new FormData();
      formData.append("file", file);

      // Get file metadata
      const newMetadata = {
        name: file.name,
        type: file.type.includes('pdf') ? 'PDF Document' : 
              file.type.includes('docx') ? 'Word Document' : 'Text Document',
        uploadDate: new Date().toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        }),
        status: "Active",
        version: "1.0",
        versionDate: new Date().toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        })
      };

      setDocumentMetadata(newMetadata);
      setAnalysisProgress(30);
      setAnalysisStage("Extracting text...");

      // Handle text files directly
      if (file.type === 'text/plain') {
        try {
          const text = await file.text();
          console.log("Text file content extracted, length:", text.length);
          setContractText(text);
          setAnalysisProgress(50);
          setAnalysisStage("Creating summary...");
          
          // Create a basic summary for text files based on actual content
          const basicSummary = {
            summary: [
              { title: "Document Type", content: "Text Document" },
              { title: "Content Length", content: `${text.length} characters` },
              { title: "Key Points", content: analyzeTextForKeyPoints(text) }
            ],
            disclaimer: "This is an automated analysis of your document. For comprehensive legal analysis, consider consulting a legal professional."
          };
          
          setCustomSummary(basicSummary);
          setAnalysisProgress(100);
        } catch (error) {
          console.error("Error reading text file:", error);
          toast.error("Could not read text file");
          throw error;
        }
      } else {
        try {
          // Extract text immediately for display
          let initialExtractedText = `Processing ${file.name}...\n\nExtracting text from ${newMetadata.type}...`;
          setContractText(initialExtractedText);
          
          setAnalysisStage("Analyzing with AI...");
          setAnalysisProgress(40);
          
          // Try to call the public analyzer API
          console.log("Sending document for analysis:", file.name);
          
          // First attempt to get just the text content directly from the file
          try {
            if (file.type === 'text/plain') {
              const text = await file.text();
              setContractText(text);
            }
          } catch (textError) {
            console.error("Failed to read text directly:", textError);
            // Continue with API call - don't throw error here
          }
          
          // Now try the API call
          try {
            const response = await fetch('/api/public-ai-analyzer', {
              method: 'POST',
              body: formData,
            });
            
            if (!response.ok) {
              throw new Error(`Server returned ${response.status}: ${await response.text()}`);
            }
            
            const data = await response.json();
            console.log("Analysis response received:", data);
            
            // Update contract text from API response
            if (data.text && data.text.length > 0) {
              setContractText(data.text);
              console.log("Contract text set, length:", data.text.length);
            }
            
            // Process analysis data
            if (data.analysis) {
              console.log("Processing analysis data from API");
              processAnalysisData(data.analysis, data.text || initialExtractedText);
            } else {
              console.log("No analysis data, generating local summary");
              // Fallback to local analysis
              const localSummary = generateLocalSummary(contractText || initialExtractedText, file.name);
              setCustomSummary(localSummary);
            }
            
          } catch (apiError) {
            console.error("API error:", apiError);
            // If API call fails, still extract text from file if possible
            if (file.type === 'text/plain') {
              try {
                const text = await file.text();
                setContractText(text);
              } catch (directReadError) {
                console.error("Failed direct file read after API error:", directReadError);
              }
            } else if (file.type.includes('pdf')) {
              setContractText(`PDF content from ${file.name}\n\nAPI processing failed. Please try again or use a different file format.`);
            } else {
              setContractText(`Document content from ${file.name}\n\nAPI processing failed. Please try again or use a different file format.`);
            }
            
            // Generate local summary as fallback
            const extractedText = contractText || initialExtractedText;
            const localSummary = generateLocalSummary(extractedText, file.name);
            setCustomSummary(localSummary);
            
            // Still show toast for API error
            toast.error("Analysis API call failed", {
              description: "Using local analysis as fallback"
            });
          }
          
          setAnalysisProgress(100);
        } catch (error) {
          console.error("Error processing file:", error);
          // Use basic analysis as fallback
          const fallbackSummary = {
            summary: [
              { title: "Document Type", content: getDocumentTypeFromFileName(file.name) },
              { title: "File Name", content: file.name },
              { title: "File Size", content: formatFileSize(file.size) },
              { title: "Upload Date", content: new Date().toLocaleDateString() },
              { title: "Content Preview", content: "Content preview unavailable." }
            ],
            disclaimer: "This is basic file information. Advanced analysis could not be performed on this document."
          };
          setCustomSummary(fallbackSummary);
          
          // Set some basic content when all else fails
          setContractText(`Failed to extract content from ${file.name}.\n\nPlease try a different file format.`);
        }
      }
    } catch (error) {
      console.error("Error processing file:", error);
      // Set error summary to ensure something is displayed
      setCustomSummary({
        summary: [
          { title: "File Processed", content: file.name },
          { title: "Status", content: "Error processing document" },
          { title: "Recommendation", content: "Please try a different file format (PDF, DOCX, or TXT)" }
        ],
        disclaimer: "An error occurred while analyzing this document. Please try again with a different document."
      });
      
      toast.error("Error processing file", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      // Complete the loading state
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(100);
        
        toast.success("Document processed", {
          description: "Your document has been processed and is now available for review"
        });
      }, 1500);
    }
  }, [contractText]);

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Helper function to get document type from filename
  const getDocumentTypeFromFileName = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'PDF Document';
      case 'doc': case 'docx': return 'Microsoft Word Document';
      case 'txt': return 'Text Document';
      case 'xls': case 'xlsx': return 'Excel Spreadsheet';
      case 'ppt': case 'pptx': return 'PowerPoint Presentation';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return 'Image';
      default: return `${extension?.toUpperCase() || 'Unknown'} Document`;
    }
  };

  // Helper function to analyze text for key points 
  const analyzeTextForKeyPoints = (text: string): string => {
    // Simple content analysis to provide meaningful summary
    const words = text.split(/\s+/).filter(Boolean).length;
    const sentences = text.split(/[.!?]+\s/).filter(Boolean).length;
    
    // Look for key contract-related terms
    const containsContractTerms = /contract|agreement|terms|parties|clause|condition|payment|confidential|disclosure|terminate|oblig|warranty|indemnity/i.test(text);
    const containsLegalTerms = /law|legal|court|arbitration|dispute|rights|statute|regulation|compliance|jurisdiction/i.test(text);
    const containsFinancialTerms = /payment|fee|price|cost|invoice|dollar|amount|fund|budget|expense/i.test(text);
    
    const keyTerms = [];
    if (containsContractTerms) keyTerms.push("contract terms");
    if (containsLegalTerms) keyTerms.push("legal provisions");
    if (containsFinancialTerms) keyTerms.push("financial details");
    
    let content = `Document contains ${words} words in approximately ${sentences} sentences. `;
    
    if (keyTerms.length > 0) {
      content += `Contains ${keyTerms.join(", ")}.`;
    } else {
      content += "No specific contract terms identified - this may not be a legal document.";
    }
    
    return content;
  };

  // Helper to generate a local summary based on text content
  const generateLocalSummary = (text: string, fileName: string) => {
    // Extract possible document type from content or filename
    let documentType = "Document";
    if (/agreement|contract/i.test(text)) {
      documentType = "Agreement/Contract";
    } else if (/disclosure|nda|confidential/i.test(text)) {
      documentType = "Confidentiality Document";
    } else if (/invoice|payment|bill/i.test(text)) {
      documentType = "Financial Document";
    } else {
      // Try to determine from filename
      if (/agreement|contract/i.test(fileName)) {
        documentType = "Agreement/Contract";
      } else if (/nda|confidential/i.test(fileName)) {
        documentType = "Confidentiality Document";
      }
    }

    // Try to extract parties involved
    let parties = "Not clearly identified";
    const nameMatches = text.match(/between\s+([^,\.]+)/i) || 
                        text.match(/([A-Z][a-z]+ [A-Z][a-z]+|[A-Z][A-Z\s]+)\s+(and|&)\s+([A-Z][a-z]+ [A-Z][a-z]+|[A-Z][A-Z\s]+)/);
    if (nameMatches) {
      parties = nameMatches[0];
    }

    // Extract first paragraph to use as preview
    let contentPreview = text.substring(0, 200);
    if (contentPreview) {
      contentPreview = contentPreview.trim() + "...";
    } else {
      contentPreview = "Content preview unavailable";
    }

    return {
      summary: [
        { title: "Document Type", content: documentType },
        { title: "Apparent Purpose", content: determineDocumentPurpose(text) },
        { title: "Possible Parties", content: parties },
        { title: "Content Preview", content: contentPreview },
        { title: "Content Analysis", content: analyzeTextForKeyPoints(text) },
        { title: "Key Terms", content: extractKeyTerms(text) }
      ],
      disclaimer: "This is an automated analysis based on document content. For accurate legal interpretation, please consult a legal professional."
    };
  };

  // Helper to determine document purpose
  const determineDocumentPurpose = (text: string): string => {
    if (/confidential|disclos|nda/i.test(text))
      return "Information protection and confidentiality";
    if (/employ|hire|staff|salary/i.test(text))
      return "Employment or staffing";
    if (/service|provide|deliver/i.test(text))
      return "Service provision";
    if (/lease|rent|property|tenant/i.test(text))
      return "Property rental or leasing";
    if (/purchase|buy|acqui|sale/i.test(text))
      return "Purchase or acquisition";
    return "Purpose not clearly identified from content";
  };

  // Helper to extract key terms from text
  const extractKeyTerms = (text: string): string => {
    const terms = [];
    if (/terminat/i.test(text)) terms.push("Termination provisions");
    if (/payment|fee|cost/i.test(text)) terms.push("Payment terms");
    if (/confidential|disclos/i.test(text)) terms.push("Confidentiality provisions");
    if (/warranty|guarantee/i.test(text)) terms.push("Warranties");
    if (/liab|indemnit/i.test(text)) terms.push("Liability/Indemnification");
    if (/law|govern|jurisdict/i.test(text)) terms.push("Governing law");
    
    return terms.length > 0 ? terms.join(", ") : "No specific legal terms identified";
  };

  // Process analysis data from API
  const processAnalysisData = (analysisText: string, documentText: string) => {
    try {
      console.log("Processing analysis data, length:", analysisText.length);
      
      // First check if the analysis is already in JSON format
      try {
        // Try to parse as JSON first
        const jsonAnalysis = JSON.parse(analysisText);
        
        if (jsonAnalysis && typeof jsonAnalysis === 'object') {
          console.log("Analysis is in JSON format");
          
          // If it's a contract_summary structure like from our OpenAI prompt
          if (jsonAnalysis.contract_summary || 
              jsonAnalysis.key_parties || 
              jsonAnalysis.contract_type) {
            
            // Transform the JSON structure to our expected format
            const summaryItems = [];
            
            // Map the JSON keys to our summary items
            if (jsonAnalysis.contract_summary) {
              summaryItems.push({ 
                title: jsonAnalysis.contract_summary.title || "Contract Summary", 
                content: jsonAnalysis.contract_summary.content 
              });
            }
            
            if (jsonAnalysis.contract_type) {
              summaryItems.push({ 
                title: jsonAnalysis.contract_type.title || "Contract Type", 
                content: jsonAnalysis.contract_type.content 
              });
            }
            
            if (jsonAnalysis.key_parties) {
              summaryItems.push({ 
                title: jsonAnalysis.key_parties.title || "Key Parties", 
                content: jsonAnalysis.key_parties.content 
              });
            }
            
            // Add other sections in a logical order
            const sections = [
              'key_obligations', 'financial_terms', 'timelines_and_dates',
              'termination_rules', 'liabilities_and_indemnities', 
              'governing_law', 'potential_risks_flags', 'next_steps_suggestions'
            ];
            
            for (const key of sections) {
              if (jsonAnalysis[key]) {
                summaryItems.push({ 
                  title: jsonAnalysis[key].title || key.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)).join(' '), 
                  content: jsonAnalysis[key].content 
                });
              }
            }
            
            // Set the custom summary
            setCustomSummary({
              summary: summaryItems,
              disclaimer: "This analysis is provided for informational purposes only and should not be considered legal advice."
            });
            
            return;
          } 
          
          // For simple JSON structure without nested title/content
          else if (Object.keys(jsonAnalysis).length > 0) {
            // Transform flat JSON to our structure
            const summaryItems = Object.entries(jsonAnalysis).map(([key, value]) => ({
              title: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              content: String(value)
            }));
            
            setCustomSummary({
              summary: summaryItems,
              disclaimer: "This analysis is provided for informational purposes only and should not be considered legal advice."
            });
            
            return;
          }
        }
      } catch (jsonError) {
        console.log("Not valid JSON, processing as text");
        // Continue with text processing since it's not valid JSON
      }
      
      // Structured approach to extract sections from analysis text
      let summaryItems = [];
      
      // Try to identify document type
      const typeMatch = analysisText.match(/document type:?\s*([^.]+)/i) || 
                       analysisText.match(/contract type:?\s*([^.]+)/i);
      if (typeMatch) {
        summaryItems.push({ title: "Document Type", content: typeMatch[1].trim() });
      } else {
        summaryItems.push({ title: "Document Type", content: getDocumentTypeFromContent(documentText) });
      }
      
      // Try to identify parties
      const partiesMatch = analysisText.match(/parties:?\s*([^.]+)/i) || 
                         analysisText.match(/key parties:?\s*([^.]+)/i);
      if (partiesMatch) {
        summaryItems.push({ title: "Parties Involved", content: partiesMatch[1].trim() });
      } else {
        const extractedParties = extractPartiesFromText(documentText);
        summaryItems.push({ title: "Parties Involved", content: extractedParties });
      }
      
      // Try to identify purpose
      const purposeMatch = analysisText.match(/purpose:?\s*([^.]+)/i) || 
                         analysisText.match(/main purpose:?\s*([^.]+)/i);
      if (purposeMatch) {
        summaryItems.push({ title: "Purpose", content: purposeMatch[1].trim() });
      } else {
        summaryItems.push({ title: "Purpose", content: determineDocumentPurpose(documentText) });
      }
      
      // Try to identify key terms
      const termsMatch = analysisText.match(/key terms:?\s*([^.]+)/i);
      if (termsMatch) {
        summaryItems.push({ title: "Key Terms", content: termsMatch[1].trim() });
      } else {
        summaryItems.push({ title: "Key Terms", content: extractKeyTerms(documentText) });
      }
      
      // Try to identify dates
      const datesMatch = analysisText.match(/dates?:?\s*([^.]+)/i) || 
                       analysisText.match(/important dates?:?\s*([^.]+)/i) || 
                       analysisText.match(/duration:?\s*([^.]+)/i);
      if (datesMatch) {
        summaryItems.push({ title: "Important Dates", content: datesMatch[1].trim() });
      }
      
      // Extract disclaimer
      let disclaimer = "This analysis is provided for informational purposes only and should not be considered legal advice.";
      const disclaimerMatch = analysisText.match(/disclaimer:?\s*([^.]+)/i);
      if (disclaimerMatch) {
        disclaimer = disclaimerMatch[1].trim();
      }
      
      // If we couldn't extract enough items from the analysis text,
      // include content preview and analysis
      if (summaryItems.length < 3) {
        if (!summaryItems.some(item => item.title === "Content Overview")) {
          // Add content preview
          let contentPreview = documentText.substring(0, 200).trim() + "...";
          summaryItems.push({ title: "Content Preview", content: contentPreview });
          
          // Add content analysis
          summaryItems.push({ title: "Content Analysis", content: analyzeTextForKeyPoints(documentText) });
        }
      }
      
      // Set the custom summary
      setCustomSummary({
        summary: summaryItems,
        disclaimer
      });
      
    } catch (error) {
      console.error("Error processing analysis data:", error);
      // Fallback to local analysis
      const localSummary = generateLocalSummary(documentText, documentMetadata.name);
      setCustomSummary(localSummary);
    }
  };

  // Helper to get document type from content
  const getDocumentTypeFromContent = (text: string): string => {
    text = text.toLowerCase();
    if (/non.?disclosure|confidential|nda/i.test(text)) 
      return "Non-Disclosure Agreement";
    if (/employment|employee|hire|staff/i.test(text)) 
      return "Employment Agreement";
    if (/service|consulting|contractor/i.test(text)) 
      return "Service Agreement";
    if (/sale|purchase|buyer|seller/i.test(text)) 
      return "Sales Agreement";
    if (/lease|rental|tenant|landlord/i.test(text)) 
      return "Lease Agreement";
    if (/agreement|contract/i.test(text)) 
      return "Legal Agreement";
    return "Document";
  };

  // Extract parties from document text
  const extractPartiesFromText = (text: string): string => {
    const patterns = [
      /between\s+([^,\.]+?)\s+and\s+([^,\.]+)/i,
      /agreement\s+between\s+([^,\.]+?)\s+and\s+([^,\.]+)/i,
      /parties:\s*([^,\.]+?)\s+and\s+([^,\.]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[2]) {
        return `${match[1].trim()} and ${match[2].trim()}`;
      }
    }
    
    return "Not clearly identified in document";
  };

  // Handle asking questions about the contract
  const handleAskQuestion = useCallback(async (question: string) => {
    console.log("Question received:", question);
    
    // In a real app, this would call an API
    // For demo purposes, we'll return a simulated response
    return {
      answer: "This is a simulated response to your question. In a production environment, this would be an actual AI-generated response based on the contract content.",
      sources: ["Section 3.2", "Clause 4(b)"]
    };
  }, []);

  return {
    documentMetadata,
    contractText,
    customSummary,
    mockSummary,
    isAnalyzing,
    analysisStage,
    analysisProgress,
    handleFileUpload,
    handleAskQuestion
  };
}
