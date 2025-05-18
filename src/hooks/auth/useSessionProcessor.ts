
import { Session } from '@supabase/supabase-js';
import { User } from '@/types/auth';
import { fetchUserProfile, createUserProfile } from './useUserProfile';

/**
 * Process user session data and return authenticated state
 */
export const processUserSession = async (
  currentSession: Session | null
): Promise<{ user: User | null; isAuthenticated: boolean }> => {
  try {
    if (!currentSession?.user) {
      return { user: null, isAuthenticated: false };
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
      
      return { user: fullUser, isAuthenticated: true };
    } else {
      // Try to create a profile if none exists
      const newProfile = await createUserProfile(supabaseUser);
      if (newProfile) {
        const fullUser = {
          ...supabaseUser,
          profile: newProfile
        } as User;
        return { user: fullUser, isAuthenticated: true };
      } else {
        // Failed to create profile
        console.error("Could not create or fetch profile, logging out");
        return { user: null, isAuthenticated: false };
      }
    }
  } catch (error) {
    console.error("Auth processing error:", error);
    return { user: null, isAuthenticated: false };
  }
};
