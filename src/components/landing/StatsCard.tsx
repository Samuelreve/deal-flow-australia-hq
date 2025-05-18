
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  value: string;
  label: string;
}

const StatsCard = ({ value, label }: StatsCardProps) => (
  <Card className="bg-gradient-to-br from-card to-muted/20 border-primary/10 hover:border-primary/30 hover:shadow-md transition-all">
    <CardContent className="pt-6">
      <div className="text-3xl font-bold text-primary mb-2">{value}</div>
      <p className="text-muted-foreground">{label}</p>
    </CardContent>
  </Card>
);

export default StatsCard;
