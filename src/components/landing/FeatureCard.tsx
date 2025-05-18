
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <motion.div 
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
    className="bg-gradient-to-br from-card to-background/80 p-6 rounded-xl shadow-md border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all"
  >
    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">
      {description}
    </p>
  </motion.div>
);

export default FeatureCard;
