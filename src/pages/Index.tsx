
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

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
  
  return (
    <div className="min-h-screen">
      <HeroSection isAuthenticated={isAuthenticated} scrollToSection={scrollToSection} />
      
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
