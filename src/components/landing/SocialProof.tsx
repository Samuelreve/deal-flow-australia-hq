import { motion } from "framer-motion";
import { Users, FileText, TrendingUp, Clock } from "lucide-react";

interface StatProps {
  value: string;
  label: string;
  icon: React.ElementType;
  delay: number;
}

const StatItem = ({ value, label, icon: Icon, delay }: StatProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="text-center"
  >
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
      {value}
    </div>
    <div className="text-sm text-muted-foreground mt-1">{label}</div>
  </motion.div>
);

const SocialProof = () => {
  const stats = [
    { value: "180+", label: "Active Deals", icon: FileText, delay: 0 },
    { value: "300+", label: "Documents Managed", icon: TrendingUp, delay: 0.1 },
    { value: "40%", label: "Faster Closings", icon: Clock, delay: 0.2 },
    { value: "5", label: "Deal Categories", icon: Users, delay: 0.3 },
  ];

  return (
    <section className="py-12 border-y border-border bg-muted/20">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
