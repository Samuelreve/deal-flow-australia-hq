
import React from 'react';

interface KeyClausesRendererProps {
  content: any;
}

const KeyClausesRenderer: React.FC<KeyClausesRendererProps> = ({ content }) => {
  if (!Array.isArray(content)) return <p>No key clauses identified.</p>;
    
  return (
    <div className="space-y-3">
      {content.map((clause, index) => (
        <div key={index} className="border-b pb-2">
          <h4 className="font-medium">{clause.heading}</h4>
          <p className="text-sm text-muted-foreground">{clause.summary}</p>
        </div>
      ))}
    </div>
  );
};

export default KeyClausesRenderer;
