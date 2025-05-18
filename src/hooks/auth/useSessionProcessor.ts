
import { Session } from "@supabase/supabase-js";
import { User } from "@/types/auth";
import { fetchUserProfile, createUserProfile } from "./useUserProfile";
import { toast } from "sonner";
import { authService } from "@/services/authService";

/**
 * Process a user session to get complete user data
 */
export const processUserSession = async (
  session: Session
): Promise<{
  user: User | null;
  isAuthenticated: boolean;
}> => {
  try {
    const supabaseUser = session.user;
    
    // Check if we have a user
    if (!supabaseUser) {
      return { user: null, isAuthenticated: false };
    }

    // Fetch profile data
    let profile = await fetchUserProfile(supabaseUser.id);
    
    // If profile doesn't exist, try to create it
    if (!profile) {
      try {
        profile = await createUserProfile(supabaseUser);
      } catch (err) {
        console.error("Failed to create user profile:", err);
      }
    }
    
    // If we still don't have a profile after trying to create one,
    // there might be an issue with the database or permissions
    if (!profile) {
      console.error("Could not create or fetch profile, continuing with limited user data");
      // We still return the basic user info without profile data
      // This allows the user to at least be logged in
      return {
        user: {
          ...supabaseUser,
          profile: null
        },
        isAuthenticated: true
      };
    }
    
    // Return complete user with profile
    return {
      user: {
        ...supabaseUser,
        profile
      },
      isAuthenticated: true
    };
  } catch (error) {
    console.error("Error processing user session:", error);
    toast.error("Failed to load your profile. Please try again later.");
    return { user: null, isAuthenticated: false };
  }
};
