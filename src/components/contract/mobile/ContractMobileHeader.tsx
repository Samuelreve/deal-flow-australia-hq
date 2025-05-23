
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface ContractMobileHeaderProps {
  selectedContract?: { name: string } | null;
  onMenuToggle?: () => void;
  children?: React.ReactNode;
}

const ContractMobileHeader: React.FC<ContractMobileHeaderProps> = ({
  selectedContract,
  children
}) => {
  return (
    <div className="lg:hidden bg-background border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h1 className="font-semibold text-lg">
            {selectedContract ? selectedContract.name : 'Contract Analysis'}
          </h1>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            {children}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ContractMobileHeader;
