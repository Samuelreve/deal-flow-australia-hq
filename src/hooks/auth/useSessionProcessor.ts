
import { Session } from '@supabase/supabase-js';
import { User, UserProfile } from '@/types/auth';
import { useUserProfile } from './useUserProfile';

export const useSessionProcessor = () => {
  const { fetchUserProfile, createUserProfile } = useUserProfile();

  const processUserSession = async (session: Session): Promise<User | null> => {
    try {
      const userId = session.user.id;
      const email = session.user.email || '';
      const name = session.user.user_metadata?.name || email.split('@')[0] || 'User';

      console.log('Processing session for user:', userId);

      // Try to fetch existing profile first
      let profile = await fetchUserProfile(userId);
      
      if (!profile) {
        console.log('No profile found, creating new profile');
        profile = await createUserProfile(userId, email, name);
        
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
