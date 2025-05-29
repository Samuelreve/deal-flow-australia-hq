
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";

const ContractAnalyzerHeader: React.FC = () => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center">
        <Sparkles className="h-4 w-4 mr-2 text-primary" />
        Contract Analyzer
      </DialogTitle>
      <DialogDescription>
        Understand this contract with AI assistance
      </DialogDescription>
    </DialogHeader>
  );
};

export default ContractAnalyzerHeader;
