
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import CopilotChat from "./CopilotChat";
import CopilotSuggestions from "./CopilotSuggestions";
import { useDealsCount } from "./useDealsCount";

interface CopilotWidgetProps { dealId?: string }
const CopilotWidget: React.FC<CopilotWidgetProps> = ({ dealId }) => {
  const [open, setOpen] = useState(false);
  const { count } = useDealsCount();
  const isPreDeal = !dealId && (count ?? 0) === 0;

  return (
    <div className="pointer-events-none">
      {/* Floating toggle button */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
        {!open && (
          <Button
            variant="default"
            size="lg"
            className="shadow-md"
            onClick={() => setOpen(true)}
            aria-label="Open Deal Copilot"
          >
            <Brain className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Surface */}
      {open && (
        <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
          <div className="relative">
            <div className="absolute -top-2 -right-2">
              <Button variant="outline" size="icon" onClick={() => setOpen(false)} aria-label="Close Copilot">
                ×
              </Button>
            </div>
            {isPreDeal ? <CopilotSuggestions /> : <CopilotChat dealId={dealId} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default CopilotWidget;
