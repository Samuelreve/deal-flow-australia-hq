
import { motion } from "framer-motion";
import StepCard from "./StepCard";
import { Calendar, FileText, Clock } from "lucide-react";

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 px-4 md:px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">How DealPilot Works</h2>
          <p className="text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
            Our structured approach simplifies even the most complex business transactions.
          </p>
        </motion.div>
        
        <div className="space-y-24">
          <StepCard 
            number={1} 
            title="Deal Creation" 
            description="Set up your deal with basic information, invite all relevant stakeholders, and establish the initial timeline. DealPilot configures the appropriate workflow based on transaction type."
            icon={<Calendar className="h-20 w-20 text-primary/60" />}
          />
          
          <StepCard 
            number={2} 
            title="Document Management" 
            description="Upload, generate, and share crucial documents. AI assistance helps clarify legal terms, generate templates, and ensure everyone understands their commitments."
            icon={<FileText className="h-20 w-20 text-primary/60" />}
          />
          
          <StepCard 
            number={3} 
            title="Milestone Progress" 
            description="Track the deal's progression through key milestones with automated notifications and reminders to keep things moving forward efficiently."
            icon={<Clock className="h-20 w-20 text-primary/60" />}
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
