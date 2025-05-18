
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
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="bg-gradient-to-br from-card to-background/80 p-6 rounded-xl shadow-md border border-border/50 hover:border-primary/20 hover:shadow-xl transition-all"
  >
    <div className="h-12 w-12 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">{title}</h3>
    <p className="text-muted-foreground">
      {description}
    </p>
  </motion.div>
);

export default FeatureCard;
