
import React from 'react';
import { AlertCircle, Check, TrendingUp, Lightbulb } from "lucide-react";

interface InsightsSectionFormatterProps {
  text: string;
}

export const InsightsSectionFormatter = ({ text }: InsightsSectionFormatterProps) => {
  if (!text) return <p>No insights available.</p>;
  
  const formattedText = text
    .split('\n')
    .map((line, index) => {
      // Match bold sections like **Overall Portfolio Health:**
      if (line.match(/^\s*\*\*([^*]+):\*\*/)) {
        const sectionName = line.match(/^\s*\*\*([^*]+):\*\*/)?.[1] || '';
        const restOfLine = line.replace(/^\s*\*\*([^*]+):\*\*/, '').trim();
        
        let icon = null;
        if (sectionName.includes("Overall Portfolio Health")) {
          icon = <TrendingUp className="h-5 w-5 mr-2 text-primary" />;
        } else if (sectionName.includes("Deals Needing Attention")) {
          icon = <AlertCircle className="h-5 w-5 mr-2 text-destructive" />;
        } else if (sectionName.includes("Deals Progressing Well")) {
          icon = <Check className="h-5 w-5 mr-2 text-green-500" />;
        } else if (sectionName.includes("Key Trends") || sectionName.includes("Observations")) {
          icon = <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />;
        } else if (sectionName.includes("Recommendations")) {
          icon = <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />;
        }
        
        return (
          <div key={index} className="mb-4">
            <h3 className="flex items-center text-md font-semibold mb-2">
              {icon}
              {sectionName}:
            </h3>
            <p className="ml-7 text-muted-foreground">{restOfLine}</p>
          </div>
        );
      } 
      // Lists with dashes or bullets
      else if (line.match(/^\s*[\-\*•]\s+/)) {
        const listItem = line.replace(/^\s*[\-\*•]\s+/, '').trim();
        return (
          <div key={index} className="ml-7 mb-2 flex items-baseline">
            <span className="mr-2 text-primary">•</span>
            <p className="text-muted-foreground">{listItem}</p>
          </div>
        );
      }
      // Regular paragraphs inside a section (indented lines)
      else if (line.match(/^\s+/) && line.trim().length > 0) {
        return <p key={index} className="ml-7 mb-2 text-muted-foreground">{line.trim()}</p>;
      }
      // Empty lines
      else if (!line.trim()) {
        return <div key={index} className="h-2" />;
      }
      // Regular text
      else {
        return <p key={index} className="mb-2 text-muted-foreground">{line}</p>;
      }
    });
  
  return <div className="space-y-1">{formattedText}</div>;
};
