import React from 'react';

interface DealDescriptionFormatterProps {
  text: string;
}

const DealDescriptionFormatter: React.FC<DealDescriptionFormatterProps> = ({ text }) => {
  if (!text) {
    return <p className="text-muted-foreground">No description available</p>;
  }

  // Split text into lines and process each line
  const lines = text.split('\n');
  
  const formatLine = (line: string, index: number) => {
    // Skip empty lines
    if (!line.trim()) {
      return <div key={index} className="h-3" />;
    }

    // Check if line is a bold section header (starts and ends with **)
    const boldHeaderMatch = line.match(/^\*\*(.+?):?\*\*$/);
    if (boldHeaderMatch) {
      return (
        <h3 key={index} className="font-semibold text-foreground mt-4 first:mt-0 mb-2">
          {boldHeaderMatch[1]}
        </h3>
      );
    }

    // Check if line contains inline bold text (e.g., **Key Details:**)
    const inlineBoldMatch = line.match(/^\*\*(.+?):\*\*/);
    if (inlineBoldMatch) {
      const remainingText = line.substring(inlineBoldMatch[0].length).trim();
      return (
        <p key={index} className="text-muted-foreground leading-relaxed mb-3">
          <span className="font-semibold text-foreground">{inlineBoldMatch[1]}:</span>
          {remainingText && ` ${remainingText}`}
        </p>
      );
    }

    // Check if line starts with bullet point or dash
    if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
      const content = line.trim().substring(1).trim();
      
      // Process inline bold within bullet points
      const processedContent = content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <span key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </span>
          );
        }
        return part;
      });

      return (
        <div key={index} className="flex gap-2 mb-2 ml-4">
          <span className="text-muted-foreground mt-1">•</span>
          <p className="text-muted-foreground leading-relaxed flex-1">
            {processedContent}
          </p>
        </div>
      );
    }

    // Regular paragraph - process inline bold
    const parts = line.split(/(\*\*[^*]+\*\*)/);
    const processedParts = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });

    return (
      <p key={index} className="text-muted-foreground leading-relaxed mb-3">
        {processedParts}
      </p>
    );
  };

  return (
    <div className="space-y-1">
      {lines.map((line, index) => formatLine(line, index))}
    </div>
  );
};

export default DealDescriptionFormatter;
