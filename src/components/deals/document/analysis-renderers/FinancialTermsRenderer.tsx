
import React from 'react';

interface FinancialTermsRendererProps {
  content: any;
}

const FinancialTermsRenderer: React.FC<FinancialTermsRendererProps> = ({ content }) => {
  if (!content || !content.terms) {
    return <p>No financial terms identified.</p>;
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
        <h4 className="font-medium mb-2">Financial Terms</h4>
        <div className="space-y-3">
          {content.terms.map((item: any, index: number) => (
            <div key={index} className="border-b pb-2">
              <h5 className="font-medium">{item.category}</h5>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              {item.amount && (
                <p className="text-sm font-medium text-green-600 mt-1">{item.amount}</p>
              )}
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

export default FinancialTermsRenderer;
