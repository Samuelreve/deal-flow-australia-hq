
import React from 'react';

interface LegalComplianceRendererProps {
  content: any;
}

const LegalComplianceRenderer: React.FC<LegalComplianceRendererProps> = ({ content }) => {
  if (!content || !content.considerations) {
    return <p>No compliance considerations identified.</p>;
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
        <h4 className="font-medium mb-2">Compliance Considerations</h4>
        <div className="space-y-3">
          {content.considerations.map((item: any, index: number) => (
            <div key={index} className="border-b pb-2">
              <h5 className="font-medium">{item.area}</h5>
              <p className="text-sm text-muted-foreground">{item.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegalComplianceRenderer;
