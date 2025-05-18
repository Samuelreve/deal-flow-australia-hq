
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useDocumentAI } from "@/hooks/useDocumentAI";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";

interface MilestoneExplainButtonProps {
  dealId: string;
  milestoneId: string;
  userRole?: string;
}

const MilestoneExplainButton: React.FC<MilestoneExplainButtonProps> = ({
  dealId,
  milestoneId,
  userRole = 'user'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { explainMilestone, loading, result, error, clearResult } = useDocumentAI({ dealId });

  const handleExplain = async () => {
    setIsOpen(true);
    if (!result) {
      await explainMilestone(milestoneId);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => clearResult(), 300); // Clear after dialog animation
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full" 
              onClick={handleExplain}
            >
              <HelpCircle className="h-4 w-4" />
              <span className="sr-only">Explain milestone</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Explain this milestone</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {result?.milestone?.title ? `About: ${result.milestone.title}` : 'Milestone Explanation'}
            </DialogTitle>
            <DialogDescription>
              AI-generated explanation of this milestone
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loading && (
              <div className="flex justify-center items-center py-8">
                <Spinner size="lg" />
              </div>
            )}

            {error && !loading && (
              <div className="text-red-500 text-center py-4">
                Failed to generate explanation. Please try again.
              </div>
            )}

            {result?.explanation && !loading && (
              <>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{result.explanation}</div>
                </div>
                
                <div className="mt-4 text-xs text-muted-foreground italic">
                  {result.disclaimer}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MilestoneExplainButton;
