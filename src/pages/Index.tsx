
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import TrustSection from "@/components/landing/TrustSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import SocialProof from "@/components/landing/SocialProof";
import ComparisonTable from "@/components/landing/ComparisonTable";
import DealCategories from "@/components/landing/DealCategories";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);
  
  // Function to handle scrolling to sections
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Handle hash in URL to scroll to section on page load
  // Skip if hash contains OAuth tokens (access_token, etc.)
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    
    // Skip OAuth callback hashes - let auth session handle them
    if (hash.includes('access_token') || hash.includes('error')) {
      return;
    }
    
    if (hash && !hash.includes('=')) {
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
      
      <main>
        <SocialProof />
        <FeaturesSection />
        <ComparisonTable />
        <DealCategories />
        <HowItWorksSection />
        <BenefitsSection />
        <TrustSection />
        <FAQSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
