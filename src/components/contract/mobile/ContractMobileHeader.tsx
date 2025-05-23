
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Menu, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface ContractMobileHeaderProps {
  selectedContract?: { name: string } | null;
  onMenuToggle?: () => void;
  children?: React.ReactNode;
}

const ContractMobileHeader: React.FC<ContractMobileHeaderProps> = ({
  selectedContract,
  children
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="lg:hidden bg-background border-b p-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <FileText className="h-5 w-5 flex-shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-lg truncate">
              {selectedContract ? selectedContract.name : 'Contract Analysis'}
            </h1>
            {selectedContract && (
              <p className="text-sm text-muted-foreground">
                Ready for analysis
              </p>
            )}
          </div>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              aria-label="Open contract menu"
              className="flex-shrink-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px]">
            <SheetHeader>
              <SheetTitle>Contracts</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ContractMobileHeader;
