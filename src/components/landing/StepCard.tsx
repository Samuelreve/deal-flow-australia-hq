
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  icon: ReactNode;
  isLast?: boolean;
}

const StepCard = ({ number, title, description, icon, isLast = false }: StepCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ 
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    }}
    className="relative"
  >
    {/* Timeline connector line */}
    {!isLast && (
      <motion.div 
        className="hidden md:block absolute left-1/2 top-full w-0.5 h-16 -translate-x-1/2 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="w-full h-full bg-gradient-to-b from-primary/30 to-transparent"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ transformOrigin: "top" }}
        />
      </motion.div>
    )}
    
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <motion.div 
        className="md:w-1/2 flex justify-center order-1 md:order-2"
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.div 
          whileHover={{ scale: 1.03, rotate: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/5 rounded-3xl p-8 shadow-xl border border-primary/10 w-full max-w-md aspect-video flex items-center justify-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            {icon}
          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div 
        className="md:w-1/2 order-2 md:order-1"
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="bg-gradient-to-br from-card via-card to-primary/5 p-8 rounded-2xl border border-primary/10 hover:shadow-xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <h3 className="text-xl font-medium flex items-center mb-4">
              <motion.span 
                className="bg-gradient-to-br from-primary to-purple-500 text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-lg shadow-primary/30 font-bold"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {number}
              </motion.span>
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent text-2xl">{title}</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed pl-14">
              {description}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

export default StepCard;
