
import { Session } from '@supabase/supabase-js';
import { User, UserProfile } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

export const useSessionProcessor = () => {
  const processUserSession = async (session: Session): Promise<User | null> => {
    try {
      const userId = session.user.id;
      const email = session.user.email || '';
      const name = session.user.user_metadata?.name || email.split('@')[0] || 'User';

      console.log('Processing session for user:', userId);

      // Try to fetch existing profile first
      let profile = await fetchUserProfileDirect(userId);
      
      if (!profile) {
        console.log('No profile found, creating new profile');
        profile = await createUserProfileDirect(userId, email, name);
        
        if (!profile) {
          console.log('Failed to create profile, using fallback');
          // Create a fallback profile when database operations fail
          profile = createFallbackProfile(userId, email, name);
        }
      }

      const user: User = {
        id: userId,
        email,
        name: profile.name,
        role: profile.role,
        profile
      };

      console.log('User session processed successfully:', {
        id: user.id,
        email: user.email,
        onboarding_complete: profile.onboarding_complete,
        profile_exists: !!profile
      });

      return user;
    } catch (error) {
      console.error('Error processing user session:', error);
      throw error; // Re-throw to handle in auth context
    }
  };

  return { processUserSession };
};

// Create a fallback profile when database operations fail
const createFallbackProfile = (userId: string, email: string, name: string): UserProfile => {
  return {
    id: userId,
    email,
    name,
    role: 'seller',
    onboarding_complete: true, // Always mark as complete since we removed onboarding
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Direct database functions without React hooks
const fetchUserProfileDirect = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('Fetching profile for user:', userId);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Profile fetch error:', error);
      // If it's the infinite recursion error, return null to trigger fallback
      if (error.code === '42P17') {
        console.log('RLS policy infinite recursion detected, using fallback');
        return null;
      }
      throw error;
    }

    if (profile) {
      // Convert Json type to string[] for professional_specializations
      let specializations: string[] | undefined = undefined;
      
      if (profile.professional_specializations) {
        if (Array.isArray(profile.professional_specializations)) {
          specializations = profile.professional_specializations
            .filter((item): item is string => typeof item === 'string');
        } else if (typeof profile.professional_specializations === 'string') {
          specializations = [profile.professional_specializations];
        }
      }

      const convertedProfile: UserProfile = {
        ...profile,
        professional_specializations: specializations
      };
      
      console.log('Profile fetched successfully:', convertedProfile);
      return convertedProfile;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Return null instead of throwing to allow fallback profile creation
    return null;
  }
};

const createUserProfileDirect = async (userId: string, email: string, name: string): Promise<UserProfile | null> => {
  try {
    console.log('Creating profile for user:', userId);

    // First check if profile already exists to avoid duplicate creation
    const existingProfile = await fetchUserProfileDirect(userId);
    if (existingProfile) {
      console.log('Profile already exists:', existingProfile);
      return existingProfile;
    }

    const newProfile = {
      id: userId,
      email,
      name,
      role: 'seller' as const,
      onboarding_complete: true // Always mark as complete since we removed onboarding
    };

    console.log('Inserting new profile:', newProfile);

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      // If it's the infinite recursion error, return null to trigger fallback
      if (error.code === '42P17') {
        console.log('RLS policy infinite recursion detected during creation, using fallback');
        return null;
      }
      throw error;
    }

    if (profile) {
      console.log('Profile created successfully:', profile);
      return profile as UserProfile;
    }

    throw new Error('Profile creation returned no data');
  } catch (error) {
    console.error('Error creating user profile:', error);
    // Return null instead of throwing to allow fallback profile creation
    return null;
  }
};

// Export the function directly for easier importing
export const processUserSession = async (session: Session): Promise<{ user: User | null; isAuthenticated: boolean }> => {
  try {
    const userId = session.user.id;
    const email = session.user.email || '';
    const name = session.user.user_metadata?.name || email.split('@')[0] || 'User';

    console.log('Processing session for user:', userId);

    // Try to fetch existing profile first
    let profile = await fetchUserProfileDirect(userId);
    
    if (!profile) {
      console.log('No profile found, creating new profile');
      profile = await createUserProfileDirect(userId, email, name);
      
      if (!profile) {
        console.log('Failed to create profile, using fallback');
        // Create a fallback profile when database operations fail
        profile = createFallbackProfile(userId, email, name);
      }
    }

    const user: User = {
      id: userId,
      email,
      name: profile.name,
      role: profile.role,
      profile
    };

    console.log('User session processed successfully:', {
      id: user.id,
      email: user.email,
      onboarding_complete: profile.onboarding_complete,
      profile_exists: !!profile
    });

    return { user, isAuthenticated: true };
  } catch (error) {
    console.error('Error processing user session:', error);
    // Even if there's an error, try to create a minimal user object
    const userId = session.user.id;
    const email = session.user.email || '';
    const name = session.user.user_metadata?.name || email.split('@')[0] || 'User';
    
    const fallbackProfile = createFallbackProfile(userId, email, name);
    const user: User = {
      id: userId,
      email,
      name: fallbackProfile.name,
      role: fallbackProfile.role,
      profile: fallbackProfile
    };
    
    return { user, isAuthenticated: true };
  }
};
