
import { motion } from "framer-motion";
import BenefitCard from "./BenefitCard";
import { CheckCircle } from "lucide-react";

const BenefitsSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section id="benefits" className="py-24 bg-gradient-to-b from-muted/20 to-background px-4 md:px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
        >
          Why Choose Trustroom.ai
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-muted-foreground mb-16 max-w-3xl mx-auto"
        >
          Experience a revolutionary approach to business transactions
        </motion.p>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <BenefitCard 
            icon={<CheckCircle className="h-8 w-8 text-green-500" />}
            title="Speed & Efficiency"
            description="Reduce transaction time by up to 40% with structured workflows and automation."
          />
          
          <BenefitCard 
            icon={<CheckCircle className="h-8 w-8 text-green-500" />}
            title="Transparency"
            description="Everyone knows exactly where things stand at all times with our real-time tracking."
          />
          
          <BenefitCard 
            icon={<CheckCircle className="h-8 w-8 text-green-500" />}
            title="Reduced Legal Costs"
            description="AI-assisted document generation and review save on expensive legal hours."
          />
          
          <BenefitCard 
            icon={<CheckCircle className="h-8 w-8 text-green-500" />}
            title="Security & Compliance"
            description="Bank-level encryption and role-based access protects sensitive information."
          />
          
          <BenefitCard 
            icon={<CheckCircle className="h-8 w-8 text-green-500" />}
            title="Stress Reduction"
            description="Clear processes and better communication eliminate deal anxiety and confusion."
          />
          
          <BenefitCard 
            icon={<CheckCircle className="h-8 w-8 text-green-500" />}
            title="Higher Success Rate"
            description="More deals close successfully with fewer last-minute surprises and roadblocks."
          />
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
