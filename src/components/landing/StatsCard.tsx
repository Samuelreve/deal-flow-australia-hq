
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  value: string;
  label: string;
  icon: LucideIcon;
  suffix?: string;
}

const StatsCard = ({ value, label, icon: Icon, suffix = "" }: StatsCardProps) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));

  useEffect(() => {
    if (hasAnimated) {
      const controls = animate(count, numericValue, {
        duration: 2,
        ease: [0.25, 0.46, 0.45, 0.94],
      });
      
      const unsubscribe = rounded.on("change", (latest) => {
        setDisplayValue(latest);
      });

      return () => {
        controls.stop();
        unsubscribe();
      };
    }
  }, [hasAnimated, numericValue, count, rounded]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onViewportEnter={() => setHasAnimated(true)}
    >
      <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="pt-6 relative">
          <div className="flex items-start justify-between mb-3">
            <motion.div 
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Icon className="h-6 w-6 text-primary" />
            </motion.div>
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-2">
            {hasAnimated ? displayValue : 0}{suffix}
          </div>
          <p className="text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
