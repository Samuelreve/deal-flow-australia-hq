
import { Session } from '@supabase/supabase-js';
import { User, UserProfile, UserRole } from "@/types/auth";
import { fetchUserProfile, createUserProfile } from "./useUserProfile";

export const processUserSession = async (session: Session): Promise<{ user: User; isAuthenticated: boolean }> => {
  if (!session?.user) {
    return { user: null, isAuthenticated: false } as any;
  }

  try {
    console.log("Processing session for user:", session.user.id);
    
    // Try to fetch existing profile with retry logic
    let profile = await fetchUserProfile(session.user.id);
    let retryCount = 0;
    const maxRetries = 2;
    
    // If no profile exists, create one with retry logic
    while (!profile && retryCount < maxRetries) {
      console.log(`No profile found, creating new profile (attempt ${retryCount + 1})`);
      profile = await createUserProfile(session.user);
      
      if (!profile) {
        retryCount++;
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (!profile) {
      console.error("Failed to create profile after retries, continuing with basic user");
      // Create a minimal profile object for the user
      const basicProfile: UserProfile = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        role: 'seller' as UserRole,
        onboarding_complete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const user = {
        ...session.user,
        profile: basicProfile,
        role: 'seller' as UserRole
      } as User;
      
      return { user, isAuthenticated: true };
    }
    
    // Ensure profile has all required fields with proper defaults
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
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };
    
    const userRole = completeProfile.role as UserRole;
    
    const user = {
      ...session.user,
      profile: completeProfile,
      role: userRole
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
    
    // Return basic user without profile if there's an error
    const user = {
      ...session.user,
      profile: null,
      role: undefined
    } as User;
    
    return { user, isAuthenticated: true };
  }
};
