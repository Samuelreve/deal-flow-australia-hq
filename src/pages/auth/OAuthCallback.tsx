import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your login...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get the session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setStatus('error');
          setMessage('Failed to complete authentication. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!session?.user) {
          setStatus('error');
          setMessage('No user session found. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Check for stored OAuth acceptance
        const storedAcceptance = sessionStorage.getItem('oauth_terms_acceptance');
        
        if (storedAcceptance) {
          try {
            const acceptance = JSON.parse(storedAcceptance);
            
            // Record legal acceptance for OAuth signup
            if (acceptance.termsAccepted && acceptance.privacyAccepted) {
              // Try to get IP address
              let ipAddress = '0.0.0.0';
              try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                ipAddress = data.ip || '0.0.0.0';
              } catch {
                // IP fetch failed, use default
              }

              // Insert into legal_acceptances
              await supabase
                .from('legal_acceptances')
                .insert({
                  user_id: session.user.id,
                  email: session.user.email || '',
                  terms_version: acceptance.termsVersion,
                  privacy_version: acceptance.privacyVersion,
                  ip_address: ipAddress,
                  user_agent: navigator.userAgent,
                  accepted_at: acceptance.timestamp
                });

              // Update profile with acceptance flags
              await supabase
                .from('profiles')
                .update({
                  terms_accepted: true,
                  terms_accepted_at: acceptance.timestamp,
                  terms_version: acceptance.termsVersion,
                  privacy_accepted: true,
                  privacy_accepted_at: acceptance.timestamp,
                  privacy_version: acceptance.privacyVersion
                })
                .eq('id', session.user.id);
            }

            // Clear the stored acceptance
            sessionStorage.removeItem('oauth_terms_acceptance');
          } catch (parseError) {
            console.error("Error processing stored acceptance:", parseError);
          }
        }

        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        
        // Redirect to dashboard
        setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
        
      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'processing' && (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                Processing
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Success
              </>
            )}
            {status === 'error' && (
              <>
                <AlertCircle className="h-6 w-6 text-destructive" />
                Error
              </>
            )}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {status === 'processing' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Please wait...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
