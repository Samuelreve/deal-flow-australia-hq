
import React from 'react';

interface GenericRendererProps {
  content: any;
}

const GenericRenderer: React.FC<GenericRendererProps> = ({ content }) => {
  return (
    <div>
      <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto max-h-96">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
};

export default GenericRenderer;
