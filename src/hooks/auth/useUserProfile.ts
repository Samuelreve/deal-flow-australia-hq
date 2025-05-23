
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';

export const useUserProfile = () => {
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, []);

  const createUserProfile = useCallback(async (userId: string, email: string, name: string): Promise<UserProfile | null> => {
    try {
      setLoading(true);
      console.log('Creating profile for user:', userId);

      // First check if profile already exists
      const existingProfile = await fetchUserProfile(userId);
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
        const fallbackProfile = await fetchUserProfile(userId);
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
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  return {
    fetchUserProfile,
    createUserProfile,
    loading
  };
};
