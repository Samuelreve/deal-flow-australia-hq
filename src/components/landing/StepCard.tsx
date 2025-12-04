
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
    whileInView={{ opacity: [0, 1], y: [20, 0] }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="relative"
  >
    {/* Timeline connector line */}
    {!isLast && (
      <div className="hidden md:block absolute left-1/2 top-full w-0.5 h-24 bg-gradient-to-b from-primary/30 to-transparent -translate-x-1/2" />
    )}
    
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <div className="md:w-1/2 flex justify-center order-1 md:order-2">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 2 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/5 rounded-3xl p-8 shadow-xl border border-primary/10 w-full max-w-md aspect-video flex items-center justify-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            {icon}
          </motion.div>
        </motion.div>
      </div>
      <div className="md:w-1/2 order-2 md:order-1">
        <div className="bg-gradient-to-br from-card via-card to-primary/5 p-8 rounded-2xl border border-primary/10 hover:shadow-xl hover:border-primary/20 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <h3 className="text-xl font-medium flex items-center mb-4">
              <span className="bg-gradient-to-br from-primary to-purple-500 text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-lg shadow-primary/30 font-bold">{number}</span>
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent text-2xl">{title}</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed pl-14">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default StepCard;
