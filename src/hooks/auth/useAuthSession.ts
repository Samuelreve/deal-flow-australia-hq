
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
    let processingSession = false;
    
    console.log('Setting up auth session hook');
    
    // Helper function to process session with timeout and error handling
    const safeProcessSession = async (currentSession: Session | null) => {
      if (!mounted || processingSession) return;
      if (!currentSession) {
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
        return;
      }

      processingSession = true;
      console.log('Processing session for user:', currentSession.user.id);
      
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session processing timeout')), 10000)
        );
        
        const sessionPromise = processUserSession(currentSession);
        const result = await Promise.race([sessionPromise, timeoutPromise]);
        
        const { user: processedUser, isAuthenticated: authStatus } = result as any;
        
        if (mounted) {
          setUser(processedUser);
          setIsAuthenticated(authStatus);
          console.log('Session processed successfully:', processedUser?.profile?.onboarding_complete);
        }
      } catch (error) {
        console.error("Session processing failed:", error);
        if (mounted) {
          // Create minimal user object on error
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            profile: {
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              name: currentSession.user.user_metadata?.name || currentSession.user.email?.split('@')[0] || 'User',
              role: 'seller',
              onboarding_complete: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          } as User);
          setIsAuthenticated(true);
        }
      } finally {
        processingSession = false;
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        
        if (!mounted) return;
        
        setSession(currentSession);
        
        if (event === 'SIGNED_OUT') {
          console.log("User signed out, clearing state");
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        } else {
          // Use setTimeout to avoid blocking the auth state change callback
          setTimeout(() => {
            safeProcessSession(currentSession);
          }, 0);
        }
      }
    );
    
    // Check for existing session
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
        
        setSession(existingSession);
        
        if (existingSession) {
          console.log("Found existing session for user", existingSession.user.id);
          await safeProcessSession(existingSession);
        } else {
          console.log("No existing session found");
          setLoading(false);
        }
      } catch (error) {
        console.error("Session check error:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    checkSession();
    
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
