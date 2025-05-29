
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useDocumentAI } from "@/hooks/useDocumentAI";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface NextActionSuggestionProps {
  dealId: string;
  isParticipant?: boolean;
  className?: string;
}

const NextActionSuggestion: React.FC<NextActionSuggestionProps> = ({
  dealId,
  isParticipant = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { suggestNextAction, loading, result, error, clearResult } = useDocumentAI({ dealId });

  const handleSuggestAction = async () => {
    setIsOpen(true);
    if (!result) {
      await suggestNextAction(dealId, "");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => clearResult(), 300); // Clear after dialog animation
  };

  // Don't show for non-participants
  if (!isParticipant) {
    return null;
  }

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            AI Coach
          </CardTitle>
          <CardDescription>Get AI assistance with this deal</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleSuggestAction} 
            variant="secondary"
            className="w-full"
          >
            Suggest Next Action
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Suggested Next Action</DialogTitle>
            <DialogDescription>
              AI-suggested next step to move your deal forward
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
                Failed to generate suggestion. Please try again.
              </div>
            )}

            {result?.suggestion && !loading && (
              <>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{result.suggestion}</div>
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

export default NextActionSuggestion;
