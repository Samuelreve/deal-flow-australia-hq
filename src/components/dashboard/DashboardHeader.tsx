
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      
      <Button onClick={() => navigate("/deals/new")}>
        <Plus className="h-4 w-4 mr-2" />
        New Deal
      </Button>
    </div>
  );
};

export default DashboardHeader;
