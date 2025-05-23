
import { Session } from '@supabase/supabase-js';
import { User, UserProfile, UserRole } from "@/types/auth";
import { fetchUserProfile, createUserProfile } from "./useUserProfile";

export const processUserSession = async (session: Session): Promise<{ user: User; isAuthenticated: boolean }> => {
  if (!session?.user) {
    console.log("No session or user found");
    return { user: null, isAuthenticated: false } as any;
  }

  console.log("Processing session for user:", session.user.id);
  
  // Create a minimal fallback profile first
  const createFallbackProfile = (): UserProfile => ({
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
    role: 'seller' as UserRole,
    onboarding_complete: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  try {
    // Try to fetch existing profile with timeout
    const fetchPromise = fetchUserProfile(session.user.id);
    const timeoutPromise = new Promise<UserProfile | null>((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
    );
    
    let profile = await Promise.race([fetchPromise, timeoutPromise]);
    
    // If no profile exists, try to create one
    if (!profile) {
      console.log("No profile found, attempting to create new profile");
      try {
        const createPromise = createUserProfile(session.user);
        const createTimeoutPromise = new Promise<UserProfile | null>((_, reject) => 
          setTimeout(() => reject(new Error('Profile creation timeout')), 5000)
        );
        
        profile = await Promise.race([createPromise, createTimeoutPromise]);
      } catch (createError) {
        console.warn("Profile creation failed:", createError);
        // Use fallback profile if creation fails
        profile = createFallbackProfile();
      }
    }
    
    // If we still don't have a profile, use fallback
    if (!profile) {
      console.warn("Using fallback profile");
      profile = createFallbackProfile();
    }
    
    // Ensure profile has all required fields
    const completeProfile: UserProfile = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      avatar_url: profile.avatar_url,
      company: profile.company,
      phone: profile.phone,
      is_professional: profile.is_professional || false,
      professional_headline: profile.professional_headline,
      professional_bio: profile.professional_bio,
      professional_firm_name: profile.professional_firm_name,
      professional_contact_email: profile.professional_contact_email,
      professional_phone: profile.professional_phone,
      professional_website: profile.professional_website,
      professional_location: profile.professional_location,
      professional_specializations: profile.professional_specializations || [],
      onboarding_complete: profile.onboarding_complete || false,
      created_at: profile.created_at || new Date().toISOString(),
      updated_at: profile.updated_at || new Date().toISOString()
    };
    
    const user = {
      id: session.user.id,
      email: session.user.email || '',
      profile: completeProfile,
      role: completeProfile.role
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
    
    // Always return a valid user with fallback profile
    const fallbackProfile = createFallbackProfile();
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
