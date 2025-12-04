
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface BenefitCardProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description: string;
}

const BenefitCard = ({ icon: Icon, iconColor = "text-primary", title, description }: BenefitCardProps) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ 
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    }}
    className="p-6 border rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative">
      <motion.div 
        className="mb-4 h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </motion.div>
      <h3 className="font-semibold text-lg mb-2 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

export default BenefitCard;
