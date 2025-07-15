
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, BarChart2 } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonRoute?: string;
  showButton?: boolean;
}

const DashboardHeader = ({ 
  title, 
  subtitle, 
  buttonLabel = "New Deal",
  buttonRoute = "/create-deal",
  showButton = true 
}: DashboardHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-md">
          <BarChart2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      
      {showButton && (
        <Button 
          onClick={() => navigate(buttonRoute)}
          variant="success"
        >
          <Plus className="h-4 w-4 mr-2" />
          {buttonLabel}
        </Button>
      )}
    </div>
  );
};

export default DashboardHeader;
