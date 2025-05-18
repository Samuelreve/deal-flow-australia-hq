
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  value: string;
  label: string;
}

const StatsCard = ({ value, label }: StatsCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: 0.1 }}
  >
    <Card className="bg-gradient-to-br from-card to-muted/20 border-primary/10 hover:border-primary/30 hover:shadow-lg transition-all">
      <CardContent className="pt-6">
        <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-2">{value}</div>
        <p className="text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export default StatsCard;
