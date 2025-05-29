
import React from 'react';
import { CardContent } from "@/components/ui/card";

interface ContractViewerContentProps {
  contractText: string;
}

const ContractViewerContent: React.FC<ContractViewerContentProps> = ({
  contractText
}) => {
  return (
    <CardContent>
      <div className="bg-white border rounded-lg p-6 max-h-[600px] overflow-y-auto">
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed">
            {contractText}
          </pre>
        </div>
      </div>
    </CardContent>
  );
};

export default ContractViewerContent;
