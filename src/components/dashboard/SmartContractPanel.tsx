
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useContractUpload } from "@/hooks/useContractUpload";
import ContractFeatures from "@/components/dashboard/contract/ContractFeatures";
import ContractActions from "@/components/dashboard/contract/ContractActions";

interface SmartContractPanelProps {
  dealId?: string;
}

const SmartContractPanel: React.FC<SmartContractPanelProps> = ({ dealId }) => {
  const { isUploading, handleFileChange } = useContractUpload(dealId);

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          Smart Contract Assistant
        </CardTitle>
        <CardDescription>
          Upload any contract to get instant analysis and understanding
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ContractFeatures />
          <ContractActions isUploading={isUploading} handleFileChange={handleFileChange} />
          
          <p className="text-xs text-muted-foreground text-center">
            This tool provides general legal information, not legal advice.
            Always consult a lawyer for final review.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartContractPanel;
