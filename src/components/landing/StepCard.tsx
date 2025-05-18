
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  icon: ReactNode;
}

const StepCard = ({ number, title, description, icon }: StepCardProps) => (
  <motion.div 
    whileInView={{ opacity: [0, 1], y: [20, 0] }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="flex flex-col md:flex-row gap-6 items-center"
  >
    <div className="md:w-1/2 flex justify-center order-1 md:order-2">
      <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-6 shadow-inner border border-primary/10 w-full max-w-md aspect-video flex items-center justify-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
      </div>
    </div>
    <div className="md:w-1/2 order-2 md:order-1">
      <div className="bg-gradient-to-br from-background to-muted/20 p-6 rounded-xl border border-primary/10 hover:shadow-md hover:border-primary/20 transition-all">
        <h3 className="text-xl font-medium flex items-center mb-3">
          <span className="bg-gradient-to-r from-primary to-purple-500 text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mr-3">{number}</span>
          <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">{title}</span>
        </h3>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  </motion.div>
);

export default StepCard;
