
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'sonner';
import { Loader2, UploadCloud, FileText, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { useEffect } from "react";

// Smart Contract Assistant Component
const SmartContractAssistant: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
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
    }
  };

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

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const { data, error } = await supabase.functions.invoke('public-ai-analyzer', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message || 'Analysis failed');
      }

      if (data && data.success && data.analysis) {
        setAnalysisResult(data.analysis);
        toast.success('Contract analysis complete!');
      } else {
        throw new Error('AI did not provide valid analysis content.');
      }

    } catch (err: any) {
      console.error('Error during AI analysis:', err);
      setAnalysisError(err.message || 'Failed to get AI analysis. Please try again.');
      toast.error('Failed to get AI analysis.');
    } finally {
      setIsAnalyzing(false);
      setFileInputKey(Date.now());
      setSelectedFile(null);
    }
  };

  return (
    <div className="bg-surface-card rounded-lg shadow-xl p-8 w-full max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-foreground mb-4 text-center">Smart Contract Assistant</h2>
      <p className="text-lg text-muted-foreground mb-6 text-center">Upload any contract to get instant AI analysis and understanding.</p>

      <div className="bg-primary/5 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold text-primary mb-3">What our AI can do:</h3>
        <ul className="list-disc list-inside text-foreground space-y-1">
          <li>Summarize key terms and sections</li>
          <li>Explain legal clauses in plain English</li>
          <li>Flag risky or missing sections</li>
          <li>Identify key parties and obligations</li>
        </ul>
      </div>

      <form onSubmit={handleAnalyzeContract} className="flex flex-col items-center gap-4">
        <label htmlFor="contract-upload" className="w-full cursor-pointer border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center hover:border-primary transition-colors">
          <UploadCloud className="h-12 w-12 text-muted-foreground mb-2" />
          <span className="text-foreground font-medium">
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
          <p className="text-destructive text-sm">{analysisError}</p>
        )}

        <button
          type="submit"
          className={`px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-semibold flex items-center justify-center transition-opacity ${(!selectedFile || isAnalyzing) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        </button>
      </form>

      {analysisResult && (
        <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
          <h3 className="text-xl font-semibold text-primary mb-3">AI Analysis Result:</h3>
          <div className="text-foreground text-sm whitespace-pre-wrap">
            {analysisResult}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <a href="/dashboard" className="inline-flex items-center px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 font-semibold">
          Go to My Deals <span className="ml-2">→</span>
        </a>
      </div>

      <p className="text-sm text-muted-foreground italic mt-8 text-center">This tool provides general legal information, not legal advice. Always consult a lawyer for final review.</p>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Function to handle scrolling to sections
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Handle hash in URL to scroll to section on page load
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);
  
  return (
    <div className="min-h-screen">
      <HeroSection isAuthenticated={isAuthenticated} scrollToSection={scrollToSection} />
      
      {/* Smart Contract Assistant Section */}
      <section id="smart-assistant" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <SmartContractAssistant />
        </div>
      </section>
      
      <main>
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <FAQSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
