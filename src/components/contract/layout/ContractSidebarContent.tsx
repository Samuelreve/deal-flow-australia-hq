
import React from 'react';
import RealContractUpload from '../RealContractUpload';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { ContractListSkeleton } from '../loading/ContractLoadingStates';
import { contractAriaLabels } from '../accessibility/ContractAccessibility';

interface Contract {
  id: string;
  name: string;
  analysis_status: string;
}

interface ContractSidebarContentProps {
  contracts: Contract[];
  selectedContract: Contract | null;
  loading: boolean;
  uploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onContractSelect: (contractId: string) => void;
}

const ContractSidebarContent: React.FC<ContractSidebarContentProps> = ({
  contracts,
  selectedContract,
  loading,
  uploading,
  onFileUpload,
  onContractSelect
}) => {
  return (
    <div className="space-y-6">
      <RealContractUpload 
        onFileUpload={onFileUpload}
        uploading={uploading}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ContractListSkeleton />
          ) : contracts.length === 0 ? (
            <div 
              className="text-center py-6"
              role="status"
              aria-label="No contracts available"
            >
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">
                No contracts uploaded yet.
              </p>
            </div>
          ) : (
            <div 
              className="space-y-2"
              role="list"
              aria-label={contractAriaLabels.contractList}
            >
              {contracts.map((contract) => (
                <Button
                  key={contract.id}
                  variant={selectedContract?.id === contract.id ? "default" : "outline"}
                  onClick={() => onContractSelect(contract.id)}
                  className="w-full justify-start text-left h-auto p-3"
                  role="listitem"
                  aria-label={contractAriaLabels.contractItem(contract.name, contract.analysis_status)}
                  aria-pressed={selectedContract?.id === contract.id}
                >
                  <FileText className="mr-2 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{contract.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {contract.analysis_status === 'completed' ? 'Ready' : 
                       contract.analysis_status === 'processing' ? 'Processing...' :
                       contract.analysis_status === 'error' ? 'Error' : 'Pending'}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractSidebarContent;
