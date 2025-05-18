
import { useState, useEffect } from "react";
import { Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { User, UserProfile } from "@/types/auth";

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to fetch the user's profile data from the database
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Profile fetch error:", error);
        return null;
      }
      
      if (data) {
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          avatar_url: data.avatar_url,
          company: data.company,
          phone: data.phone
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        setSession(currentSession);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Use setTimeout to defer Supabase calls
          setTimeout(async () => {
            try {
              console.log("Processing SIGNED_IN event");
              
              const supabaseUser = currentSession.user;
              
              // Check if user profile exists
              const profileData = await fetchUserProfile(supabaseUser.id);
              
              if (!profileData) {
                // Create a new profile with default values
                const newProfile: UserProfile = {
                  id: supabaseUser.id,
                  email: supabaseUser.email || "",
                  name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
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
                
                // Create combined User object
                const fullUser = {
                  ...supabaseUser,
                  profile: newProfile
                } as User;
                
                setUser(fullUser);
              } else {
                // Use existing profile
                const fullUser = {
                  ...supabaseUser,
                  profile: profileData
                } as User;
                
                console.log("Using existing profile for user", fullUser);
                setUser(fullUser);
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
          
          const profileData = await fetchUserProfile(existingSession.user.id);
          
          if (profileData) {
            const fullUser = {
              ...existingSession.user,
              profile: profileData
            } as User;
            
            console.log("Setting user from existing session", fullUser);
            setUser(fullUser);
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
