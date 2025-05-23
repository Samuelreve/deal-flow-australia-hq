import { useState, useEffect } from "react";
import { Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";
import { processUserSession } from "./useSessionProcessor";

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener FIRST to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        
        if (!mounted) return;
        
        // Update session immediately
        setSession(currentSession);
        
        if (event === 'SIGNED_OUT') {
          console.log("User signed out, clearing state");
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        } 
        else if (currentSession) {
          // Process the session to get user profile
          try {
            const { user: processedUser, isAuthenticated: authStatus } = await processUserSession(currentSession);
            if (mounted) {
              setUser(processedUser);
              setIsAuthenticated(authStatus);
              console.log('User profile loaded from auth state change:', processedUser?.profile?.onboarding_complete);
            }
          } catch (error) {
            console.error("Failed to process session in auth state change:", error);
            if (mounted) {
              setIsAuthenticated(!!currentSession);
              setUser({
                ...currentSession.user,
                profile: null,
                role: undefined
              } as User);
            }
          } finally {
            if (mounted) {
              setLoading(false);
            }
          }
        } else {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );
    
    // THEN check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking for existing session...");
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        if (!mounted) return;
        
        if (existingSession) {
          console.log("Found existing session for user", existingSession.user.id);
          setSession(existingSession);
          
          try {
            const { user: processedUser, isAuthenticated: authStatus } = await processUserSession(existingSession);
            setUser(processedUser);
            setIsAuthenticated(authStatus);
            console.log('Initial user profile loaded:', processedUser?.profile?.onboarding_complete);
          } catch (error) {
            console.error("Failed to process initial session:", error);
            // Keep the session active even if profile fetch fails
            setIsAuthenticated(!!existingSession);
            setUser({
              ...existingSession.user,
              profile: null,
              role: undefined
            } as User);
          }
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    checkSession();
    
    // Clean up 
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isAuthenticated,
    loading,
    setLoading,
    setUser,
    setSession,
    setIsAuthenticated
  };
};
