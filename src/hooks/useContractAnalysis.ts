
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
    "This Mutual Non-Disclosure Agreement (this "Agreement") is entered into as of [Date] by and between [Company Name], with its principal offices at [Address] ("Company"), and [Other Party], located at [Address] ("Recipient").\n\n" +
    "1. Purpose. The parties wish to explore a business opportunity of mutual interest and in connection with this opportunity, each party may disclose to the other certain confidential technical and business information that the disclosing party desires the receiving party to treat as confidential.\n\n" +
    "2. "Confidential Information" means any information disclosed by either party to the other party, either directly or indirectly, in writing, orally or by inspection of tangible objects, including without limitation documents, prototypes, samples, plant and equipment, research, product plans, products, services, customer lists, markets, software, developments, inventions, processes, designs, drawings, engineering, hardware configuration information, marketing or finance documents, which is designated as "Confidential," "Proprietary" or some similar designation. Information communicated orally shall be considered Confidential Information if such information is confirmed in writing as being Confidential Information within a reasonable time after the initial disclosure."
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

      // For text files, we can read them directly
      if (file.type === 'text/plain') {
        const text = await file.text();
        setContractText(text);
        setAnalysisProgress(50);
      } else {
        // For other file types, we need to send to the public-ai-analyzer edge function
        try {
          setAnalysisStage("Analyzing with AI...");
          
          const response = await fetch('/api/public-ai-analyzer', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to process document');
          }
          
          const data = await response.json();
          
          if (data.text) {
            setContractText(data.text);
          }
          
          if (data.analysis) {
            // Parse the analysis text into structured data
            const sections = data.analysis.split('\n\n');
            const summaryItems = [];
            
            // Process each section to create structured data
            for (const section of sections) {
              if (section.startsWith('1. Document Type')) {
                summaryItems.push({ title: "Document Type", content: section.replace('1. Document Type', '').trim() });
              } else if (section.startsWith('2. Key Parties')) {
                summaryItems.push({ title: "Parties Involved", content: section.replace('2. Key Parties', '').trim() });
              } else if (section.startsWith('3. Main Purpose')) {
                summaryItems.push({ title: "Purpose", content: section.replace('3. Main Purpose', '').trim() });
              } else if (section.startsWith('4. Key Terms')) {
                summaryItems.push({ title: "Key Terms", content: section.replace('4. Key Terms', '').trim() });
              } else if (section.startsWith('5. Important Dates')) {
                summaryItems.push({ title: "Important Dates", content: section.replace('5. Important Dates', '').trim() });
              }
            }
            
            // Add a disclaimer from the end of the analysis
            const disclaimer = data.analysis.includes("Disclaimer:") 
              ? data.analysis.substring(data.analysis.indexOf("Disclaimer:")) 
              : "This analysis is provided for informational purposes only and should not be considered legal advice.";
            
            // Set the custom summary
            setCustomSummary({
              summary: summaryItems.length > 0 ? summaryItems : mockSummary.summary,
              disclaimer
            });
          }
          
          setAnalysisProgress(100);
          
        } catch (error) {
          console.error("Error analyzing document:", error);
          toast.error("Failed to analyze document", {
            description: error instanceof Error ? error.message : "Unknown error occurred"
          });
          // Use the mock data as fallback
          setCustomSummary(mockSummary);
        }
      }
      
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing file", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      // Simulate delay to show the loading state
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(100);
        
        toast.success("Contract analyzed successfully", {
          description: "AI summary and insights are now available"
        });
      }, 1500);
    }
  }, []);

  // Handle asking questions about the contract
  const handleAskQuestion = useCallback(async (question: string) => {
    toast.info(`Question received: ${question}`, {
      description: "In a real application, this would query the AI with your question about the contract."
    });
    
    // Mock response - in a real app, this would call an API
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
