
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building, Users, FileCheck, ChevronRight } from "lucide-react";

export const LoginInfoPanel = () => {
  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Streamlined Business Exchange Platform</h2>
        <p className="text-muted-foreground mt-2">
          Trustroom.ai helps facilitate business sales from initial offer to final closing, with structured workflows and comprehensive tools.
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <Building className="h-8 w-8 text-primary flex-shrink-0" />
          <div>
            <h3 className="font-medium">Complete Deal Management</h3>
            <p className="text-sm text-muted-foreground">
              Track progress, manage documents, and coordinate all aspects of your business sale in one place.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <Users className="h-8 w-8 text-primary flex-shrink-0" />
          <div>
            <h3 className="font-medium">Role-Based Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Work efficiently with buyers, sellers, lawyers, and other stakeholders with tailored interfaces for each role.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <FileCheck className="h-8 w-8 text-primary flex-shrink-0" />
          <div>
            <h3 className="font-medium">Structured Deal Process</h3>
            <p className="text-sm text-muted-foreground">
              Follow clear milestones, maintain compliance, and ensure nothing falls through the cracks.
            </p>
          </div>
        </div>
      </div>
      
      <div className="pt-6">
        <Button variant="link" className="text-primary group" asChild>
          <Link to="/">
            Learn more about Trustroom.ai
            <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default LoginInfoPanel;
