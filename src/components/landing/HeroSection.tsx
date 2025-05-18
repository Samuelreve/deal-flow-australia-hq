
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StatsCard from "./StatsCard";

interface HeroSectionProps {
  isAuthenticated: boolean;
  scrollToSection: (sectionId: string) => void;
}

const HeroSection = ({ isAuthenticated, scrollToSection }: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <header className="relative bg-gradient-to-b from-background to-background/80">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="h-16 px-4 md:px-6 flex items-center justify-between border-b backdrop-blur-sm z-10 relative">
        <div className="text-xl font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">DealPilot</div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button onClick={() => navigate("/dashboard")}>Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>Log in</Button>
              <Button onClick={() => navigate("/signup")}>Get Started</Button>
            </>
          )}
        </div>
      </div>
      
      <div className="py-16 md:py-28 lg:py-32 px-4 md:px-6 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto max-w-5xl relative z-10"
        >
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-600">
              Revolutionizing Business Transactions
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              DealPilot reduces the typical business sale timeline from months to weeks through AI-powered workflows, secure document management, and intelligent collaboration.
            </p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" onClick={() => navigate("/signup")} className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white border-0">
                Start For Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection("how-it-works")}>
                See How It Works
              </Button>
            </motion.div>
          </div>
          
          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center"
          >
            <StatsCard value="40%" label="Faster Deal Completion" />
            <StatsCard value="90%" label="Reduced Documentation Errors" />
            <StatsCard value="60%" label="Less Legal Back-and-Forth" />
          </motion.div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-muted/30 to-transparent"></div>
      </div>
    </header>
  );
};

export default HeroSection;
