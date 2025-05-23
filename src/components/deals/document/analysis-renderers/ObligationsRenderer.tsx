
import React from 'react';

interface ObligationsRendererProps {
  content: any;
}

const ObligationsRenderer: React.FC<ObligationsRendererProps> = ({ content }) => {
  if (!content || !content.obligations) {
    return <p>No obligations identified.</p>;
  }
    
  return (
    <div className="space-y-4">
      {content.summary && (
        <div>
          <h4 className="font-medium mb-2">Summary</h4>
          <p>{content.summary}</p>
        </div>
      )}
      
      <div>
        <h4 className="font-medium mb-2">Obligations & Commitments</h4>
        <div className="space-y-3">
          {content.obligations.map((item: any, index: number) => (
            <div key={index} className="border-b pb-2">
              <div className="flex justify-between">
                <h5 className="font-medium">{item.party}</h5>
                {item.deadline && (
                  <span className="text-sm text-blue-600">{item.deadline}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{item.obligation}</p>
              {item.section && (
                <p className="text-xs text-muted-foreground mt-1">Section: {item.section}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ObligationsRenderer;
