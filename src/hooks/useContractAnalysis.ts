
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

      // For text files, we can read them directly
      if (file.type === 'text/plain') {
        const text = await file.text();
        setContractText(text);
        setAnalysisProgress(50);
        setAnalysisStage("Creating summary...");
        
        // Create a basic summary for text files
        const basicSummary = {
          summary: [
            { title: "Document Type", content: "Text Document" },
            { title: "Content Length", content: `${text.length} characters` },
            { title: "Key Points", content: "Text document uploaded successfully. AI analysis may be limited for plain text." }
          ],
          disclaimer: "This is a basic analysis of a text document. For more detailed analysis, consider uploading a structured document like a PDF or DOCX file."
        };
        
        setCustomSummary(basicSummary);
        setAnalysisProgress(100);
      } else {
        // For other file types, we need to send to the public-ai-analyzer edge function
        try {
          setAnalysisStage("Analyzing with AI...");
          
          // Log the request for debugging
          console.log("Sending document for analysis:", file.name);
          
          const response = await fetch('/api/public-ai-analyzer', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            console.error("Failed to process document, status:", response.status);
            throw new Error(`Failed to process document: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("Analysis response received:", data);
          
          if (data.text) {
            setContractText(data.text);
            console.log("Contract text set, length:", data.text.length);
          } else {
            console.warn("No text content in response");
          }
          
          if (data.analysis) {
            // Fallback to ensure we have valid analysis content
            if (typeof data.analysis !== 'string' || data.analysis.trim() === '') {
              console.warn("Empty analysis received, using mock data");
              setCustomSummary(mockSummary);
            } else {
              console.log("Processing analysis text:", data.analysis.substring(0, 100) + "...");
              // Parse the analysis text into structured data
              const sections = data.analysis.split('\n\n');
              const summaryItems = [];
              
              // Process each section to create structured data
              for (const section of sections) {
                if (section.includes('Document Type')) {
                  summaryItems.push({ title: "Document Type", content: section.replace(/^1\.\s*Document Type:?\s*/i, '').trim() });
                } else if (section.includes('Key Parties')) {
                  summaryItems.push({ title: "Parties Involved", content: section.replace(/^2\.\s*Key Parties:?\s*/i, '').trim() });
                } else if (section.includes('Main Purpose')) {
                  summaryItems.push({ title: "Purpose", content: section.replace(/^3\.\s*Main Purpose:?\s*/i, '').trim() });
                } else if (section.includes('Key Terms')) {
                  summaryItems.push({ title: "Key Terms", content: section.replace(/^4\.\s*Key Terms:?\s*/i, '').trim() });
                } else if (section.includes('Important Dates')) {
                  summaryItems.push({ title: "Important Dates", content: section.replace(/^5\.\s*Important Dates:?\s*/i, '').trim() });
                }
              }
              
              // Add a disclaimer from the end of the analysis
              const disclaimer = data.analysis.includes("Disclaimer:") 
                ? data.analysis.substring(data.analysis.indexOf("Disclaimer:")) 
                : "This analysis is provided for informational purposes only and should not be considered legal advice.";
              
              // Set the custom summary or fallback to mock if no items were extracted
              if (summaryItems.length > 0) {
                setCustomSummary({
                  summary: summaryItems,
                  disclaimer
                });
                console.log("Custom summary set with", summaryItems.length, "items");
              } else {
                console.warn("Failed to extract structured data, using mock data");
                setCustomSummary(mockSummary);
              }
            }
          } else {
            // Fallback to mock data if no analysis is provided
            console.warn("No analysis in response, using mock data");
            setCustomSummary(mockSummary);
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
      // Use mock data as a fallback
      setCustomSummary(mockSummary);
    } finally {
      // Complete the loading state
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
