
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
          console.error('Failed to create profile, creating fallback user');
          // Create a fallback user without profile for now
          return {
            id: userId,
            email,
            name,
            profile: null
          };
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
      return null;
    }
  };

  return { processUserSession };
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
      throw error;
    }

    if (profile) {
      // Convert Json type to string[] for professional_specializations
      let specializations: string[] | undefined = undefined;
      
      if (profile.professional_specializations) {
        if (Array.isArray(profile.professional_specializations)) {
          // Filter and map to ensure we only get strings
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
    return null;
  }
};

const createUserProfileDirect = async (userId: string, email: string, name: string): Promise<UserProfile | null> => {
  try {
    console.log('Creating profile for user:', userId);

    // First check if profile already exists
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
      onboarding_complete: false
    };

    console.log('Inserting new profile:', newProfile);

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      
      // If profile creation fails, try to fetch existing profile
      console.log('Profile creation failed, trying to fetch existing profile');
      const fallbackProfile = await fetchUserProfileDirect(userId);
      if (fallbackProfile) {
        console.log('Found existing profile as fallback:', fallbackProfile);
        return fallbackProfile;
      }
      
      throw error;
    }

    if (profile) {
      // Convert Json type to string[] for professional_specializations
      let specializations: string[] | undefined = undefined;
      
      if (profile.professional_specializations) {
        if (Array.isArray(profile.professional_specializations)) {
          // Filter and map to ensure we only get strings
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
      
      console.log('Profile created successfully:', convertedProfile);
      return convertedProfile;
    }

    return null;
  } catch (error) {
    console.error('Error creating user profile:', error);
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
        console.error('Failed to create profile, creating fallback user');
        // Create a fallback user without profile for now
        return {
          user: {
            id: userId,
            email,
            name,
            profile: null
          },
          isAuthenticated: true
        };
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
    return { user: null, isAuthenticated: false };
  }
};
