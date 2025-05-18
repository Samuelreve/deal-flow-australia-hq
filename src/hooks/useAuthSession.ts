
import { useState, useEffect } from "react";
import { Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { User, UserProfile } from "@/types/auth";
import { toast } from "sonner";

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to fetch the user's profile data from the database
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log("Fetching profile for user:", userId);
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
        console.log("Retrieved profile:", data);
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
      console.log("Creating profile for user:", supabaseUser.id);
      
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
        toast.error(`Profile creation failed: ${error.message}`);
        return null;
      }
      
      console.log("Created new profile for user:", newProfile);
      return newProfile;
    } catch (error) {
      console.error("Error creating user profile:", error);
      return null;
    }
  };

  // Process user data and set authenticated state
  const processUserData = async (currentSession: Session | null) => {
    try {
      if (!currentSession?.user) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const supabaseUser = currentSession.user;
      
      // Try to fetch existing profile
      const profileData = await fetchUserProfile(supabaseUser.id);
      
      if (profileData) {
        // Use existing profile
        const fullUser = {
          ...supabaseUser,
          profile: profileData
        } as User;
        
        setUser(fullUser);
        setIsAuthenticated(true);
      } else {
        // Try to create a profile if none exists
        const newProfile = await createUserProfile(supabaseUser);
        if (newProfile) {
          const fullUser = {
            ...supabaseUser,
            profile: newProfile
          } as User;
          setUser(fullUser);
          setIsAuthenticated(true);
        } else {
          // Failed to create profile
          console.error("Could not create or fetch profile, logging out");
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error("Auth processing error:", error);
      setIsAuthenticated(false);
    }
  };

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
              processUserData(currentSession);
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
          await processUserData(existingSession);
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
