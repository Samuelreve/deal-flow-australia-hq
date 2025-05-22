
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DocumentTabProps {
  contractText: string;
}

const DocumentTab: React.FC<DocumentTabProps> = ({ contractText }) => {
  const [expanded, setExpanded] = useState(false);
  const maxHeight = expanded ? '100%' : '600px';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Full Document</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`bg-muted p-4 rounded-md overflow-auto transition-all`} style={{ maxHeight }}>
          <pre className="text-sm whitespace-pre-wrap font-mono text-muted-foreground">
            {contractText}
          </pre>
        </div>
        
        {contractText && contractText.length > 500 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-4 w-full flex items-center justify-center"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" /> Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" /> Show More
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentTab;
