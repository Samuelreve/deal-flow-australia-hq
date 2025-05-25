
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, UploadCloud, FileText, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

// Define the expected structure of the AI analysis result
interface ContractAnalysisResult {
  contract_summary: { title: string; content: string; };
  key_parties: { title: string; content: string; };
  contract_type: { title: string; content: string; };
  key_obligations: { title: string; content: string; };
  financial_terms: { title: string; content: string; };
  timelines_and_dates: { title: string; content: string; };
  termination_rules: { title: string; content: string; };
  liabilities_and_indemnities: { title: string; content: string; };
  governing_law: { title: string; content: string; };
  potential_risks_flags: { title: string; content: string; };
  next_steps_suggestions: { title: string; content: string; };
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ContractAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // State for Q&A
  const [userQuestion, setUserQuestion] = useState('');
  const [qaResponse, setQaResponse] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);
  const [fullDocumentTextContext, setFullDocumentTextContext] = useState<string | null>(null);

  // Handle File Selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setAnalysisError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
        setSelectedFile(null);
        setFileInputKey(Date.now());
        return;
      }
      
      const MAX_FILE_SIZE_MB = 5;
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setAnalysisError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        setSelectedFile(null);
        setFileInputKey(Date.now());
        return;
      }

      setSelectedFile(file);
      setAnalysisResult(null);
      setAnalysisError(null);
      setQaResponse(null);
      setQaError(null);
      setFullDocumentTextContext(null);
    } else {
      setSelectedFile(null);
      setAnalysisResult(null);
      setAnalysisError(null);
      setQaResponse(null);
      setQaError(null);
      setFullDocumentTextContext(null);
    }
  };

  // Handle Initial Contract Analysis Request
  const handleAnalyzeContract = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setAnalysisError('Please upload a contract file first.');
      toast.error('Please upload a contract file.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    setQaResponse(null);
    setQaError(null);
    setFullDocumentTextContext(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('requestType', 'analyze_document');

      const response = await fetch('/api/public-ai-analyzer', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Analysis failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.success && result.analysis && result.fullDocumentText) {
        setAnalysisResult(result.analysis as ContractAnalysisResult);
        setFullDocumentTextContext(result.fullDocumentText);
        toast.success('Contract analysis complete!');
      } else {
        throw new Error('AI did not provide valid analysis content or document text.');
      }

    } catch (err: any) {
      console.error('Error during AI analysis (upload):', err);
      setAnalysisError(err.message || 'Failed to get AI analysis. Please try again.');
      toast.error('Failed to get AI analysis.');
    } finally {
      setIsAnalyzing(false);
      setFileInputKey(Date.now());
      setSelectedFile(null);
    }
  };

  // Handle Q&A Submission
  const handleAskQuestion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userQuestion.trim()) {
      setQaError('Please enter a question.');
      return;
    }
    if (!fullDocumentTextContext) {
      setQaError('Document content not available for Q&A. Please upload a document first.');
      return;
    }

    setIsAnswering(true);
    setQaResponse(null);
    setQaError(null);

    try {
      const dataToSend = {
        requestType: 'answer_question',
        userQuestion: userQuestion.trim(),
        fullDocumentText: fullDocumentTextContext,
      };

      const response = await fetch('/api/public-ai-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Q&A failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.success && result.answer) {
        setQaResponse(result.answer);
        setUserQuestion('');
        toast.success('Answer generated!');
      } else {
        throw new Error('AI did not provide an answer.');
      }

    } catch (err: any) {
      console.error('Error during AI Q&A:', err);
      setQaError(err.message || 'Failed to get AI answer. Please try again.');
      toast.error('Failed to get AI answer.');
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            Smart Contract Assistant
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Upload any contract to get instant, deep analysis and understanding
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* What our AI can do section */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">What our AI can do:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Summarize key terms and sections</li>
                <li>Explain legal clauses in plain English</li>
                <li>Flag risky or missing sections</li>
                <li>Answer specific questions about the contract</li>
              </ul>
            </CardContent>
          </Card>

          {/* Upload Form */}
          <form onSubmit={handleAnalyzeContract} className="space-y-4">
            <label htmlFor="contract-upload" className="w-full cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center hover:border-blue-500 transition-colors bg-white">
              <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
              <span className="text-gray-700 font-medium text-center">
                {selectedFile ? selectedFile.name : 'Click to upload a Contract (PDF, DOCX, TXT)'}
              </span>
              <input
                key={fileInputKey}
                type="file"
                id="contract-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                disabled={isAnalyzing}
              />
            </label>

            {analysisError && (
              <p className="text-red-500 text-sm text-center">{analysisError}</p>
            )}

            <div className="flex justify-center">
              <Button
                type="submit"
                className="px-8 py-3"
                disabled={!selectedFile || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" /> Analyze Contract
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* AI Analysis Result Display */}
          {analysisResult && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-xl text-blue-800">AI Analysis Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analysisResult).map(([key, section]) => (
                  <div key={key} className="bg-white p-4 rounded-lg">
                    <h4 className="font-bold text-base mb-2 text-gray-800">{section.title}</h4>
                    <p className="whitespace-pre-wrap text-gray-700 text-sm">{section.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Q&A Section */}
          {analysisResult && fullDocumentTextContext && (
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Ask a Question about the Contract</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAskQuestion} className="space-y-4">
                  <Textarea
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    className="resize-none"
                    placeholder="e.g., 'Can I exit this contract early?' or 'Who is responsible for liabilities?'"
                    rows={3}
                    disabled={isAnswering}
                  />
                  
                  {qaError && (
                    <p className="text-red-500 text-sm">{qaError}</p>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!userQuestion.trim() || isAnswering}
                  >
                    {isAnswering ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Getting Answer...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" /> Ask AI
                      </>
                    )}
                  </Button>
                </form>

                {/* AI Q&A Response Display */}
                {qaResponse && (
                  <Card className="mt-4 bg-blue-100 border-blue-300">
                    <CardContent className="pt-4">
                      <div className="text-blue-800 whitespace-pre-wrap text-sm">
                        {qaResponse}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/deals')}
              className="px-6"
            >
              Go to My Deals
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/contract-analysis')}
              className="px-6"
            >
              Contract Analysis Tool
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
