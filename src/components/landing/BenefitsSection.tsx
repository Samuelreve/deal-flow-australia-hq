
import { motion } from "framer-motion";
import BenefitCard from "./BenefitCard";
import { CheckCircle } from "lucide-react";

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-20 bg-gradient-to-b from-muted/20 to-background px-4 md:px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center mb-12"
        >
          Why Choose DealPilot
        </motion.h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <BenefitCard 
            icon={<CheckCircle className="h-8 w-8 text-green-500 mb-3" />}
            title="Speed & Efficiency"
            description="Reduce transaction time by up to 40% with structured workflows and automation."
          />
          
          <BenefitCard 
            icon={<CheckCircle className="h-8 w-8 text-green-500 mb-3" />}
            title="Transparency"
            description="Everyone knows exactly where things stand at all times."
          />
          
          <BenefitCard 
            icon={<CheckCircle className="h-8 w-8 text-green-500 mb-3" />}
            title="Reduced Legal Costs"
            description="AI-assisted document generation and review save on expensive legal hours."
          />
          
          <BenefitCard 
            icon={<CheckCircle className="h-8 w-8 text-green-500 mb-3" />}
            title="Security & Compliance"
            description="Bank-level encryption and role-based access protects sensitive information."
          />
          
          <BenefitCard 
            icon={<CheckCircle className="h-8 w-8 text-green-500 mb-3" />}
            title="Stress Reduction"
            description="Clear processes and better communication eliminate deal anxiety."
          />
          
          <BenefitCard 
            icon={<CheckCircle className="h-8 w-8 text-green-500 mb-3" />}
            title="Higher Success Rate"
            description="More deals close successfully with fewer last-minute surprises."
          />
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
