
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InsightsSectionFormatter } from './InsightsSectionFormatter';

interface InsightsContentProps {
  insightsText: string;
}

const InsightsContent = ({ insightsText }: InsightsContentProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  return (
    <div className={`${isExpanded ? '' : 'max-h-[400px] overflow-hidden relative'}`}>
      <InsightsSectionFormatter text={insightsText} />
      
      {/* Disclaimer */}
      {insightsText && (
        <>
          <div className="h-4"></div>
          <Alert className="mt-4 bg-muted/50 border-muted">
            <AlertDescription className="text-xs text-muted-foreground">
              This is an AI-generated analysis based on your deal portfolio data. 
              It is provided for informational purposes only and should not replace professional judgment.
            </AlertDescription>
          </Alert>
        </>
      )}
      
      {/* Expand/collapse gradient and button */}
      {!isExpanded && insightsText && insightsText.length > 500 && (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(true)}
            >
              Show More
            </Button>
          </div>
        </>
      )}
      
      {isExpanded && (
        <div className="mt-4 flex justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(false)}
          >
            Show Less
          </Button>
        </div>
      )}
    </div>
  );
};

export default InsightsContent;
