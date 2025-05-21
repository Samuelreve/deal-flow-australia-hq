
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { useEffect } from "react";
import SmartContractPanel from "@/components/dashboard/SmartContractPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

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
      
      {/* Add Smart Contract Assistant in a prominent position after the hero section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-800">
              Smart Contract Assistant
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload any contract and get instant analysis, summaries, and answers to your questions
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {isAuthenticated ? (
            <SmartContractPanel />
          ) : (
            <Card className="bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-2 flex items-center">
                <div className="mx-auto flex flex-col items-center text-center">
                  <FileText className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-xl">Smart Contract Assistant</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6">
                  Upload any contract to get instant analysis and understanding.
                  Our AI can summarize key terms, explain legal clauses, and answer your questions.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mb-6 max-w-md mx-auto">
                  <h4 className="font-medium text-sm">What our AI can do:</h4>
                  <ul className="text-sm mt-2 space-y-1.5 text-left">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span> 
                      <span>Summarize key terms and sections</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span> 
                      <span>Explain legal clauses in plain English</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span> 
                      <span>Answer questions about the contract</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium"
                >
                  Sign in to get started
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
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
