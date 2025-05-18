
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BenefitCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const BenefitCard = ({ icon, title, description }: BenefitCardProps) => (
  <motion.div 
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="p-5 border rounded-xl bg-gradient-to-br from-card to-background/80 hover:border-primary/20 hover:shadow-xl transition-all"
  >
    <div className="mb-3">{icon}</div>
    <h3 className="font-semibold text-lg mb-2 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </motion.div>
);

export default BenefitCard;
