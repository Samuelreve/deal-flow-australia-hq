import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DocuSignTokenInfo {
  has_token: boolean;
  expires_at?: string;
  account_id?: string;
  base_uri?: string;
  is_expired: boolean;
}

export const useDocuSignToken = () => {
  const [tokenInfo, setTokenInfo] = useState<DocuSignTokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const checkTokenStatus = async () => {
    if (!user?.id) {
      setTokenInfo(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // SECURITY: Use secure function that doesn't expose sensitive tokens
      const { data, error: rpcError } = await supabase.rpc('has_valid_docusign_token');

      if (rpcError) {
        console.error('Error checking DocuSign token:', rpcError);
        setError('Failed to check DocuSign token status');
        setTokenInfo(null);
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        setTokenInfo(data as unknown as DocuSignTokenInfo);
      } else {
        setTokenInfo(null);
      }
    } catch (err: any) {
      console.error('Error checking DocuSign token:', err);
      setError(err.message || 'Failed to check DocuSign token status');
      setTokenInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTokenStatus();
  }, [user?.id]);

  const needsAuthentication = () => {
    return !tokenInfo?.has_token || tokenInfo?.is_expired;
  };

  const getAuthUrl = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const callbackUrl = `${supabaseUrl}/functions/v1/docusign-oauth-callback`;
    const integrationKey = 'your-integration-key'; // This would come from your environment
    
    return `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=${integrationKey}&redirect_uri=${encodeURIComponent(callbackUrl)}`;
  };

  return {
    tokenInfo,
    loading,
    error,
    needsAuthentication,
    getAuthUrl,
    refreshTokenStatus: checkTokenStatus
  };
};