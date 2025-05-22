
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const DangerZone: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDeactivateAccount = () => {
    setIsDialogOpen(true);
  };
  
  const handleConfirmDeactivate = () => {
    // Would actually deactivate the account in a real implementation
    toast({
      title: "Account Deactivation Requested",
      description: "Your request to deactivate your account has been received. Customer support will contact you to complete this process.",
    });
    setIsDialogOpen(false);
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
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to deactivate your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be easily undone. Your account will be deactivated, and all your deals and documents will no longer be accessible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <p className="mb-2 text-sm font-medium">
              Type <span className="font-bold">{user?.email?.split('@')[0] || 'confirm'}</span> to confirm:
            </p>
            <Input 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-1"
              placeholder={`Type "${user?.email?.split('@')[0] || 'confirm'}" to confirm`}
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeactivate}
              disabled={confirmText !== (user?.email?.split('@')[0] || 'confirm')}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deactivate Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DangerZone;
