
import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ContractActionsProps {
  isUploading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const ContractActions: React.FC<ContractActionsProps> = ({ isUploading, handleFileChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const navigateToDeals = () => {
    // Navigate to deals page so user can select a deal
    navigate('/deals');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Button 
          variant="outline" 
          className="w-full relative overflow-hidden" 
          disabled={isUploading || !user}
        >
          <label 
            htmlFor="contract-upload" 
            className="absolute inset-0 cursor-pointer flex items-center justify-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload a Contract"}
          </label>
        </Button>
        <input 
          type="file" 
          id="contract-upload" 
          className="hidden" 
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt"
          disabled={isUploading || !user}
        />
      </div>
      
      <Button 
        variant="default" 
        onClick={navigateToDeals}
        className="w-full"
      >
        Go to My Deals
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export default ContractActions;
