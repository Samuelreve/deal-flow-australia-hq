
import { useState, useEffect } from "react";
import { Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        setSession(currentSession);
        
        if (event === 'SIGNED_IN' && currentSession) {
          // Use setTimeout to defer Supabase calls
          setTimeout(async () => {
            try {
              console.log("Processing SIGNED_IN event");
              
              // Check if user profile exists
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();
              
              if (profileError && profileError.code !== 'PGRST116') {
                // Handle error but not 'no rows returned' error
                console.error("Profile fetch error:", profileError);
                return;
              }
              
              // If profile doesn't exist, create one
              if (!profileData) {
                const newProfile = {
                  id: currentSession.user.id,
                  email: currentSession.user.email,
                  name: currentSession.user.user_metadata.name || currentSession.user.email?.split('@')[0] || 'User',
                  role: 'seller' as const
                };
                
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert([newProfile]);
                  
                if (insertError) {
                  console.error("Profile creation error:", insertError);
                  return;
                }
                
                console.log("Created new profile for user", newProfile);
                setUser(newProfile);
              } else {
                // Use existing profile
                const currentUser: User = {
                  id: profileData.id,
                  email: profileData.email,
                  name: profileData.name,
                  role: profileData.role,
                  avatar: profileData.avatar_url,
                };
                
                console.log("Using existing profile for user", currentUser);
                setUser(currentUser);
              }
              
              setIsAuthenticated(true);
            } catch (error) {
              console.error("Authentication processing error:", error);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out, clearing state");
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );
    
    // THEN check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking for existing session...");
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (existingSession) {
          console.log("Found existing session for user", existingSession.user.id);
          setSession(existingSession);
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', existingSession.user.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }
          
          if (profileData) {
            const currentUser: User = {
              id: profileData.id,
              email: profileData.email,
              name: profileData.name,
              role: profileData.role,
              avatar: profileData.avatar_url,
            };
            
            console.log("Setting user from existing session", currentUser);
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            console.log("No profile found for user with existing session");
          }
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Clean up subscription on unmount
    return () => {
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
