
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentUploadService } from '@/hooks/useDocumentUploadService';
import { useAuth } from '@/contexts/AuthContext';
import { handleContractUpload } from '@/services/contractService';

export function useContractUpload(dealId?: string) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const { uploadDocument } = useDocumentUploadService();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      setIsUploading(true);
      await handleContractUpload(file, dealId, user.id, uploadDocument, navigate);
    } finally {
      setIsUploading(false);
    }
  };
  
  return {
    isUploading,
    handleFileChange
  };
}
