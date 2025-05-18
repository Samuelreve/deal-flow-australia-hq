
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
        console.log('Auth state changed:', event);
        setSession(currentSession);
        
        if (event === 'SIGNED_IN' && currentSession) {
          // Don't call other Supabase functions directly here to avoid deadlocks
          // Use setTimeout to defer Supabase calls
          setTimeout(async () => {
            try {
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
                
                setUser(currentUser);
              }
              
              setIsAuthenticated(true);
            } catch (error) {
              console.error("Authentication error:", error);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );
    
    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (existingSession) {
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
            
            setUser(currentUser);
            setIsAuthenticated(true);
          }
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
    setUser,
    setSession,
    setIsAuthenticated,
    setLoading
  };
};
