
import { motion } from "framer-motion";
import BenefitCard from "./BenefitCard";
import { Zap, Eye, DollarSign, Shield, Heart, TrendingUp } from "lucide-react";

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

  const benefits = [
    {
      icon: Zap,
      iconColor: "text-yellow-500",
      title: "Speed & Efficiency",
      description: "Complete transactions up to 60% faster with streamlined workflows and automated document processing."
    },
    {
      icon: Eye,
      iconColor: "text-blue-500",
      title: "Full Transparency",
      description: "Every stakeholder has clear visibility into deal progress, documents, and next steps at all times."
    },
    {
      icon: DollarSign,
      iconColor: "text-green-500",
      title: "Reduced Legal Costs",
      description: "AI-powered document analysis reduces the need for extensive legal review, saving thousands in fees."
    },
    {
      icon: Shield,
      iconColor: "text-purple-500",
      title: "Security & Compliance",
      description: "Enterprise-grade encryption and compliance features protect sensitive business information."
    },
    {
      icon: Heart,
      iconColor: "text-pink-500",
      title: "Stress Reduction",
      description: "Clear processes and automated reminders eliminate confusion and reduce transaction anxiety."
    },
    {
      icon: TrendingUp,
      iconColor: "text-emerald-500",
      title: "Higher Success Rate",
      description: "Structured approach and professional tools increase the likelihood of successful deal completion."
    }
  ];

  return (
    <section id="benefits" className="py-24 px-4 md:px-6 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Benefits for All Parties
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Whether you're buying, selling, or advising, Trustroom.ai provides advantages that make the entire process smoother.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {benefits.map((benefit, index) => (
            <BenefitCard 
              key={index}
              icon={benefit.icon}
              iconColor={benefit.iconColor}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
