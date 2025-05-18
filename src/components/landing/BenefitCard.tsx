
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
    transition={{ duration: 0.2 }}
    className="p-5 border rounded-xl bg-gradient-to-br from-card to-background/80 hover:border-primary/20 hover:shadow-lg transition-all"
  >
    {icon}
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </motion.div>
);

export default BenefitCard;
