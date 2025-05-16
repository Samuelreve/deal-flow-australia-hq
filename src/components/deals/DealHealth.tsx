
import { Progress } from "@/components/ui/progress";

interface DealHealthProps {
  healthScore: number;
}

const DealHealth = ({ healthScore }: DealHealthProps) => {
  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <Progress value={healthScore} className="h-2 flex-1" />
        <span className="text-sm font-medium">{healthScore}%</span>
      </div>
      <p className="text-xs text-muted-foreground">Based on progress and activity</p>
    </>
  );
};

export default DealHealth;
