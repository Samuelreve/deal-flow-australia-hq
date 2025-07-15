
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardWelcomeHeaderProps {
  welcomeMessage: string;
  currentDate: string;
}

const DashboardWelcomeHeader = ({ welcomeMessage, currentDate }: DashboardWelcomeHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8 mt-2 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{welcomeMessage}</h1>
        <p className="text-muted-foreground mt-2">
          {currentDate} · Welcome to your personalized deal dashboard
        </p>
      </div>
      <Button onClick={() => navigate('/create-deal')} variant="success">
        <Plus className="mr-2 h-4 w-4" />
        Create Deal
      </Button>
    </div>
  );
};

export default DashboardWelcomeHeader;
