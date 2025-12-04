
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.02 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="bg-gradient-to-br from-card via-card to-primary/5 p-6 rounded-2xl shadow-lg border border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative">
      <div className="h-14 w-14 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  </motion.div>
);

export default FeatureCard;
