
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, UserPlus, LogIn, UserCheck, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const AcceptInvitePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // States for invitation processing
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationDetails, setInvitationDetails] = useState<{
    dealTitle?: string;
    inviterName?: string;
    inviteeRole?: string;
  } | null>(null);
  const [initialTokenCheck, setInitialTokenCheck] = useState(false);

  // Initial token verification (before auth)
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError("No invitation token provided");
        return;
      }

      try {
        const { data: session } = await supabase.auth.getSession();
        
        // Make unauthenticated call to check token and get basic info
        const response = await fetch(
          "https://wntmgfuclbdrezxcvzmw.supabase.co/functions/v1/verify-invitation-token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(session.session 
                ? { Authorization: `Bearer ${session.session.access_token}` } 
                : {})
            },
            body: JSON.stringify({ token })
          }
        );

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || "Invalid invitation token");
        }
        
        setInvitationDetails({
          dealTitle: result.dealTitle,
          inviterName: result.inviterName,
          inviteeRole: result.inviteeRole
        });
      } catch (error: any) {
        console.error("Token verification error:", error);
        setError(error.message || "Failed to verify invitation token");
      } finally {
        setInitialTokenCheck(true);
      }
    };

    if (token && !initialTokenCheck) {
      checkToken();
    }
  }, [token, initialTokenCheck]);

  // Process invitation acceptance when user is authenticated
  useEffect(() => {
    const acceptInvitation = async () => {
      if (!token || !isAuthenticated || !user || processing) {
        return;
      }

      setProcessing(true);
      setError(null);

      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          throw new Error("Authentication session not found");
        }

        // Call the accept invitation endpoint
        const response = await fetch(
          "https://wntmgfuclbdrezxcvzmw.supabase.co/functions/v1/accept-invitation",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.session.access_token}`
            },
            body: JSON.stringify({ token })
          }
        );

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || "Failed to accept invitation");
        }
        
        // Success - redirect to the deal page
        toast.success("You've successfully joined the deal!");
        navigate(`/deals/${result.dealId}`);
      } catch (error: any) {
        console.error("Invitation acceptance error:", error);
        setError(error.message || "Failed to accept invitation");
      } finally {
        setProcessing(false);
      }
    };

    // Auto-attempt to accept invitation when user is authenticated
    if (isAuthenticated && user && token && initialTokenCheck && !error) {
      acceptInvitation();
    }
  }, [isAuthenticated, user, token, initialTokenCheck, processing, navigate, error]);

  // Handle loading state
  if (authLoading || (isAuthenticated && processing)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Accepting Invitation</CardTitle>
            <CardDescription>Please wait while we process your invitation</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              {authLoading 
                ? "Checking authentication status..." 
                : "Processing your invitation..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if token invalid or other processing error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-destructive">Invitation Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <p className="text-center text-muted-foreground mt-4">
              If you believe this is a mistake, please contact the person who invited you
              or try again later.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/deals")} variant="outline">
              Go to Deals
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // User is not authenticated, show login/signup options
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Accept Invitation</CardTitle>
            <CardDescription>
              {invitationDetails ? (
                <>
                  You've been invited by {invitationDetails.inviterName || "someone"} to join 
                  {invitationDetails.dealTitle ? ` "${invitationDetails.dealTitle}"` : " a deal"} as 
                  {invitationDetails.inviteeRole ? ` a ${invitationDetails.inviteeRole}` : " a participant"}.
                </>
              ) : (
                "You've been invited to join a deal on DealPilot."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center">
              To accept this invitation, please log in to your account or sign up if you're new.
            </p>
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={() => navigate(`/login?inviteToken=${token}`)}
                className="w-full"
              >
                <LogIn className="mr-2 h-4 w-4" /> Log in to accept
              </Button>
              <Button 
                onClick={() => navigate(`/signup?inviteToken=${token}`)}
                variant="outline" 
                className="w-full"
              >
                <UserPlus className="mr-2 h-4 w-4" /> Sign up to accept
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback UI - should rarely be seen as the component should be redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Processing Invitation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center p-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">Please wait...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitePage;
