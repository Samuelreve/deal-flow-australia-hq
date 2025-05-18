
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
      
      if (error) {
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

  // Function to create a new profile
  const createUserProfile = async (supabaseUser: any): Promise<UserProfile | null> => {
    try {
      const newProfile: UserProfile = {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        role: 'seller' as const
      };
      
      const { error } = await supabase
        .from('profiles')
        .insert([newProfile]);
        
      if (error) {
        console.error("Profile creation error:", error);
        return null;
      }
      
      console.log("Created new profile for user", newProfile);
      return newProfile;
    } catch (error) {
      console.error("Error creating user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        setSession(currentSession);
        
        if (currentSession) {
          setIsAuthenticated(true);
          
          // Defer profile fetch to avoid recursion issues
          setTimeout(async () => {
            const supabaseUser = currentSession.user;
            if (supabaseUser) {
              try {
                // Try to fetch existing profile
                const profileData = await fetchUserProfile(supabaseUser.id);
                
                if (profileData) {
                  // Use existing profile
                  const fullUser = {
                    ...supabaseUser,
                    profile: profileData
                  } as User;
                  
                  setUser(fullUser);
                } else if (event === 'SIGNED_IN') {
                  // Only try to create a profile when signing in and no profile exists
                  const newProfile = await createUserProfile(supabaseUser);
                  if (newProfile) {
                    const fullUser = {
                      ...supabaseUser,
                      profile: newProfile
                    } as User;
                    setUser(fullUser);
                  }
                }
              } catch (error) {
                console.error("Auth processing error:", error);
              }
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
        
        if (error) {
          throw error;
        }
        
        if (existingSession) {
          console.log("Found existing session for user", existingSession.user.id);
          setSession(existingSession);
          setIsAuthenticated(true);
          
          try {
            const profileData = await fetchUserProfile(existingSession.user.id);
            
            if (profileData) {
              const fullUser = {
                ...existingSession.user,
                profile: profileData
              } as User;
              
              setUser(fullUser);
            } else {
              // If no profile, try to create one (rare case)
              const newProfile = await createUserProfile(existingSession.user);
              if (newProfile) {
                const fullUser = {
                  ...existingSession.user,
                  profile: newProfile
                } as User;
                setUser(fullUser);
              }
            }
          } catch (profileError) {
            console.error("Error processing user profile during session check:", profileError);
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
