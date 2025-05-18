import { useState, useEffect } from "react";
import { Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";
import { processUserSession } from "./useSessionProcessor";
import { toast } from "sonner";

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
        } 
        else if (currentSession) {
          // Defer profile fetch to avoid recursion issues
          setTimeout(() => {
            if (mounted) {
              processUserSession(currentSession)
                .then(({ user, isAuthenticated }) => {
                  setUser(user);
                  setIsAuthenticated(isAuthenticated);
                })
                .catch(error => {
                  console.error("Failed to process session:", error);
                  // Don't sign out on profile fetch errors
                  // Just keep the basic session active
                  setIsAuthenticated(!!currentSession);
                });
            }
          }, 0);
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
          setLoading(false);
          return;
        }
        
        if (!mounted) return;
        
        if (existingSession) {
          console.log("Found existing session for user", existingSession.user.id);
          setSession(existingSession);
          
          try {
            const { user, isAuthenticated } = await processUserSession(existingSession);
            setUser(user);
            setIsAuthenticated(isAuthenticated);
          } catch (error) {
            console.error("Failed to process initial session:", error);
            // Keep the session active even if profile fetch fails
            setIsAuthenticated(!!existingSession);
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
