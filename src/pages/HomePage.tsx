
import React, { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Loader2, UploadCloud, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      // Basic file type validation
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
      // Basic file size validation
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
    } else {
      setSelectedFile(null);
      setAnalysisResult(null);
      setAnalysisError(null);
    }
  };

  // Handle AI analysis request
  const handleAnalyzeContract = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setAnalysisError('Please upload a contract file first.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload a contract file."
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    try {
      // Create FormData to send the file to the backend
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Call the public backend endpoint for AI analysis
      const response = await fetch('https://wntmgfuclbdrezxcvzmw.supabase.co/functions/v1/public-analyze-contract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Analysis failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.analysis) {
        setAnalysisResult(result.analysis + "\n\n" + (result.disclaimer || ''));
        toast({
          title: "Success",
          description: "Contract analysis complete!"
        });
      } else {
        throw new Error('AI did not provide analysis content.');
      }

    } catch (err: any) {
      console.error('Error during AI analysis:', err);
      setAnalysisError(err.message || 'Failed to get AI analysis. Please try again.');
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err.message || "Failed to get AI analysis."
      });
    } finally {
      setIsAnalyzing(false);
      setFileInputKey(Date.now());
      setSelectedFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Smart Contract Assistant</h2>
        <p className="text-lg text-gray-600 mb-6">Upload any contract to get instant analysis and understanding.</p>

        {/* Features section */}
        <div className="bg-blue-50 p-6 rounded-lg text-left mb-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-3">What our AI can do:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Summarize key terms and sections</li>
            <li>Explain legal clauses in plain English</li>
            <li>Answer questions about the contract (future enhancement)</li>
          </ul>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleAnalyzeContract} className="flex flex-col items-center gap-4">
          <label
            htmlFor="contract-upload"
            className="w-full cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition-colors"
          >
            <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
            <span className="text-gray-700 font-medium">
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
            <p className="text-red-500 text-sm">{analysisError}</p>
          )}

          <Button
            type="submit"
            className="px-6 py-3 flex items-center justify-center"
            disabled={!selectedFile || isAnalyzing}
            variant="default"
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
        </form>

        {/* AI Analysis Result Display */}
        {analysisResult && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg text-left border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">AI Analysis Result:</h3>
            <pre className="whitespace-pre-wrap text-gray-800 text-sm font-sans leading-relaxed">{analysisResult}</pre>
            <p className="text-sm text-gray-500 italic mt-4">
              This tool provides general legal information, not legal advice. Always consult a lawyer for final review.
            </p>
          </div>
        )}

        {/* Go to My Deals Button */}
        <div className="mt-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="px-6 py-3"
          >
            Go to My Deals <span className="ml-2">→</span>
          </Button>
        </div>

        {/* General Disclaimer */}
        <p className="text-sm text-gray-500 italic mt-8">
          This tool provides general legal information, not legal advice. Always consult a lawyer for final review.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
