import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileSignature, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useDocuSignToken } from '@/hooks/useDocuSignToken';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const DocuSignConnection: React.FC = () => {
  const { user } = useAuth();
  const { tokenInfo, loading, refreshTokenStatus } = useDocuSignToken();
  const [connecting, setConnecting] = useState(false);

  const isConnected = tokenInfo?.has_token && !tokenInfo?.is_expired;

  // Listen for OAuth callback success
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'DOCUSIGN_AUTH_SUCCESS') {
        toast.success('DocuSign connected successfully!');
        refreshTokenStatus();
        setConnecting(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refreshTokenStatus]);

  const handleConnect = async () => {
    if (!user?.id) {
      toast.error('Please log in first');
      return;
    }

    setConnecting(true);

    try {
      // Build the authorization URL with user_id in state
      const supabaseUrl = 'https://wntmgfuclbdrezxcvzmw.supabase.co';
      const redirectUri = `${supabaseUrl}/functions/v1/docusign-oauth-callback`;
      
      // State contains user_id for the callback
      const state = btoa(JSON.stringify({ user_id: user.id }));
      
      // Note: Integration key needs to be fetched or configured
      // For now, we'll call the oauth function to get the auth URL
      const response = await fetch(`${supabaseUrl}/functions/v1/docusign-oauth/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id })
      });

      if (!response.ok) {
        throw new Error('Failed to get authorization URL');
      }

      const data = await response.json();
      
      // Modify the auth URL to include our state with user_id
      const authUrl = new URL(data.authorizationUrl);
      authUrl.searchParams.set('state', state);

      // Open popup window for OAuth
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        authUrl.toString(),
        'DocuSign Authorization',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      // Check if popup was blocked
      if (!popup) {
        toast.error('Popup blocked. Please allow popups for this site.');
        setConnecting(false);
        return;
      }

      // Poll for popup close (in case message doesn't fire)
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setConnecting(false);
          // Refresh status after a delay
          setTimeout(refreshTokenStatus, 1000);
        }
      }, 500);

    } catch (error: any) {
      console.error('Error connecting DocuSign:', error);
      toast.error(error.message || 'Failed to start DocuSign connection');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    // TODO: Implement disconnect by deleting token from database
    toast.info('Disconnect feature coming soon');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            DocuSign
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileSignature className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">DocuSign</CardTitle>
              <CardDescription>E-signature service for document signing</CardDescription>
            </div>
          </div>
          {isConnected ? (
            <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              <AlertCircle className="h-3 w-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <p className="text-muted-foreground">
                Your DocuSign account is connected. You can now send documents for e-signature directly from deal milestones.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
              <Button variant="ghost" size="sm" onClick={() => refreshTokenStatus()}>
                Refresh Status
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your DocuSign account to enable document signing workflows in your deals.
            </p>
            <Button 
              onClick={handleConnect} 
              disabled={connecting}
              className="gap-2"
            >
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Connect DocuSign
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocuSignConnection;
