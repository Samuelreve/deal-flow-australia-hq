
import React from 'react';
import { AlertTriangle } from "lucide-react";

interface RisksRendererProps {
  content: any;
}

const RisksRenderer: React.FC<RisksRendererProps> = ({ content }) => {
  if (!Array.isArray(content)) return <p>No risks identified.</p>;
    
  return (
    <div className="space-y-3">
      {content.map((risk, index) => (
        <div key={index} className="border-b pb-3">
          <div className="flex gap-2 items-center">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h4 className="font-medium">{risk.risk}</h4>
          </div>
          <p className="text-sm my-1">Location: {risk.location || 'Not specified'}</p>
          <p className="text-sm text-muted-foreground">{risk.explanation}</p>
        </div>
      ))}
    </div>
  );
};

export default RisksRenderer;
