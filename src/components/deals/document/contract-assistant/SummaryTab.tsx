
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface SummaryTabProps {
  summaryResult: any | null;
  isAnalyzing: boolean;
}

const SummaryTab: React.FC<SummaryTabProps> = ({ summaryResult, isAnalyzing }) => {
  if (isAnalyzing) {
    return <div className="py-8 text-center">Analyzing contract...</div>;
  }
  
  if (!summaryResult) {
    return <div className="py-8 text-center">No summary available</div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Summary</h3>
        <p className="mt-2 whitespace-pre-line">{summaryResult.summaryText}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-medium">Contract Type</h3>
        <p className="mt-2">{summaryResult.contractType || "Not specified"}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-medium">Parties Involved</h3>
        {summaryResult.parties && summaryResult.parties.length > 0 ? (
          <ul className="mt-2 list-disc pl-5">
            {summaryResult.parties.map((party: string, i: number) => (
              <li key={i}>{party}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2">No parties explicitly specified</p>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-medium">Key Obligations</h3>
        {summaryResult.keyObligations && summaryResult.keyObligations.length > 0 ? (
          <ul className="mt-2 list-disc pl-5">
            {summaryResult.keyObligations.map((obligation: string, i: number) => (
              <li key={i}>{obligation}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2">No key obligations explicitly specified</p>
        )}
      </div>
      
      {/* Additional sections could be added here for timelines, terminationRules, and liabilities */}
    </div>
  );
};

export default SummaryTab;
