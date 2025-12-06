
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardWelcomeHeaderProps {
  welcomeMessage: string;
  currentDate: string;
}

const DashboardWelcomeHeader = ({ welcomeMessage, currentDate }: DashboardWelcomeHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div data-tour="welcome-header" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-8 mb-8">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {welcomeMessage}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-2">
            <Calendar className="h-4 w-4" />
            <span>{currentDate}</span>
          </div>
          <p className="text-muted-foreground mt-1">
            Welcome to your personalized deal dashboard
          </p>
        </div>
        <Button 
          data-tour="create-deal-button"
          onClick={() => navigate('/create-deal')}
          className="btn-premium text-primary-foreground"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Deal
        </Button>
      </div>
    </div>
  );
};

export default DashboardWelcomeHeader;
