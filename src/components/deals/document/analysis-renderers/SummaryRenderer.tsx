
import React from 'react';

interface SummaryRendererProps {
  content: any;
}

const SummaryRenderer: React.FC<SummaryRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-sm max-w-none">
      <p className="whitespace-pre-wrap">{content.summary}</p>
    </div>
  );
};

export default SummaryRenderer;
