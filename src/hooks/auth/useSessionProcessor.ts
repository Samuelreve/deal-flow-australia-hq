
import { Session } from '@supabase/supabase-js';
import { User, UserProfile } from "@/types/auth";
import { fetchUserProfile, createUserProfile } from "./useUserProfile";

export const processUserSession = async (session: Session): Promise<{ user: User; isAuthenticated: boolean }> => {
  if (!session?.user) {
    return { user: null, isAuthenticated: false };
  }

  try {
    // Try to fetch existing profile
    let profile = await fetchUserProfile(session.user.id);
    
    // If no profile exists, create one
    if (!profile) {
      profile = await createUserProfile(session.user);
    }
    
    // Create combined user object
    const user: User = {
      ...session.user,
      profile,
      role: profile?.role
    };
    
    return { user, isAuthenticated: true };
  } catch (error) {
    console.error("Error processing user session:", error);
    
    // Return basic user without profile if there's an error
    const user: User = {
      ...session.user,
      profile: null
    };
    
    return { user, isAuthenticated: true };
  }
};
