
import { motion } from "framer-motion";
import FeatureCard from "./FeatureCard";
import { ShieldCheck, FileText, MessageSquare, BarChart3 } from "lucide-react";

const FeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-muted/30 to-background px-4 md:px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Our Platform Features</h2>
          <p className="text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
            Trustroom.ai combines cutting-edge technology with industry expertise to streamline every aspect of business sales.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <FeatureCard 
            icon={<ShieldCheck className="h-6 w-6 text-primary" />}
            title="AI-Powered Document Intelligence"
            description="Our advanced AI explains complex legal clauses in plain language, generates customized document templates, and provides quick summaries."
          />
          
          <FeatureCard 
            icon={<FileText className="h-6 w-6 text-primary" />}
            title="Smart Document Management"
            description="Secure storage with version history, automated organization, and role-based access ensures everyone sees exactly what they need."
          />
          
          <FeatureCard 
            icon={<MessageSquare className="h-6 w-6 text-primary" />}
            title="Unified Communication"
            description="Centralized messaging, contextual commenting, and document annotations keep all communications in one place, eliminating confusion."
          />
          
          <FeatureCard 
            icon={<BarChart3 className="h-6 w-6 text-primary" />}
            title="Progress Tracking"
            description="Visual milestone tracking with automated updates keeps everyone informed of deal progress and upcoming steps."
          />
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
