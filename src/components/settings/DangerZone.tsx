
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DangerZone: React.FC = () => {
  const { toast } = useToast();

  const handleDeactivateAccount = () => {
    toast({
      title: "Account deactivation",
      description: "This feature is not yet implemented.",
    });
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Permanent actions that affect your account
      </p>
      
      <Button 
        variant="destructive" 
        onClick={handleDeactivateAccount}
      >
        Deactivate Account
      </Button>
    </div>
  );
};

export default DangerZone;
