
import { motion } from "framer-motion";
import StepCard from "./StepCard";
import { Calendar, FileText, Clock } from "lucide-react";

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 px-4 md:px-6 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-40 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-5xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            How Trustroom.ai Works
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Our structured approach simplifies even the most complex business transactions.
          </p>
        </motion.div>
        
        <div className="space-y-16">
          <StepCard 
            number={1} 
            title="Deal Creation" 
            description="Set up your deal with basic information, invite all relevant stakeholders, and establish the initial timeline. Trustroom.ai configures the appropriate workflow based on transaction type."
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
            isLast
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
