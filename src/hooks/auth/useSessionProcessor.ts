
import { Session } from '@supabase/supabase-js';
import { User, UserProfile, UserRole } from "@/types/auth";
import { fetchUserProfile, createUserProfile } from "./useUserProfile";

export const processUserSession = async (session: Session): Promise<{ user: User; isAuthenticated: boolean }> => {
  if (!session?.user) {
    console.log("No session or user found");
    return { user: null, isAuthenticated: false } as any;
  }

  console.log("Processing session for user:", session.user.id);
  
  try {
    // Try to fetch existing profile first
    let profile = await fetchUserProfile(session.user.id);
    
    // If no profile exists, create one
    if (!profile) {
      console.log("No profile found, creating new profile");
      profile = await createUserProfile(session.user);
      
      // If creation still fails, create a minimal fallback
      if (!profile) {
        console.log("Profile creation failed, using fallback");
        profile = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          role: 'seller' as UserRole,
          onboarding_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    }
    
    const user = {
      id: session.user.id,
      email: session.user.email || '',
      profile: profile,
      role: profile.role
    } as User;
    
    console.log("User session processed successfully:", {
      id: user.id,
      email: user.email,
      onboarding_complete: user.profile?.onboarding_complete,
      profile_exists: !!user.profile
    });
    
    return { user, isAuthenticated: true };
  } catch (error) {
    console.error("Error processing user session:", error);
    
    // Return fallback user to prevent blocking login
    const fallbackProfile: UserProfile = {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
      role: 'seller' as UserRole,
      onboarding_complete: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const user = {
      id: session.user.id,
      email: session.user.email || '',
      profile: fallbackProfile,
      role: fallbackProfile.role
    } as User;
    
    console.log("Using fallback user due to processing error");
    return { user, isAuthenticated: true };
  }
};
