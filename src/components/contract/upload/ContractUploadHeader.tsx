
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const ContractUploadHeader: React.FC = () => {
  return (
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Enhanced Contract Upload
      </CardTitle>
    </CardHeader>
  );
};

export default ContractUploadHeader;
