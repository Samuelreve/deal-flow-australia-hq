
import React from 'react';
import RealContractUpload from '../RealContractUpload';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { ContractListSkeletonEnhanced } from '../loading/EnhancedLoadingStates';
import { contractAriaLabelsEnhanced } from '../accessibility/EnhancedAccessibility';
import { ContractUploadingState } from '../loading/EnhancedLoadingStates';

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
  uploadProgress?: number;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onContractSelect: (contractId: string) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'processing':
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Ready';
    case 'processing':
      return 'Processing...';
    case 'error':
      return 'Error';
    default:
      return 'Pending';
  }
};

const ContractSidebarContent: React.FC<ContractSidebarContentProps> = ({
  contracts,
  selectedContract,
  loading,
  uploading,
  uploadProgress = 0,
  onFileUpload,
  onContractSelect
}) => {
  return (
    <div className="space-y-6">
      <RealContractUpload 
        onFileUpload={onFileUpload}
        uploading={uploading}
        uploadProgress={uploadProgress}
      />
      
      {uploading && (
        <ContractUploadingState
          fileName={selectedContract?.name}
          progress={uploadProgress}
        />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ContractListSkeletonEnhanced />
          ) : contracts.length === 0 ? (
            <div 
              className="text-center py-8"
              role="status"
              aria-label="No contracts available"
            >
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No contracts yet</h3>
              <p className="text-muted-foreground text-sm">
                Upload your first contract to get started with AI-powered analysis.
              </p>
            </div>
          ) : (
            <div 
              className="space-y-2"
              role="list"
              aria-label={contractAriaLabelsEnhanced.contractList}
            >
              {contracts.map((contract, index) => (
                <Button
                  key={contract.id}
                  variant={selectedContract?.id === contract.id ? "default" : "outline"}
                  onClick={() => onContractSelect(contract.id)}
                  className="w-full justify-start text-left h-auto p-4 transition-all hover:scale-[1.02]"
                  role="listitem"
                  aria-label={contractAriaLabelsEnhanced.contractItem(
                    contract.name, 
                    getStatusLabel(contract.analysis_status),
                    index,
                    contracts.length
                  )}
                  aria-pressed={selectedContract?.id === contract.id}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{contract.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusIcon(contract.analysis_status)}
                          <span className="text-xs text-muted-foreground">
                            {getStatusLabel(contract.analysis_status)}
                          </span>
                        </div>
                      </div>
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
