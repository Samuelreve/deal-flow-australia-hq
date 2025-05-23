
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

      console.log('Profile fetched successfully:', profile);
      return profile;
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

      console.log('Profile created successfully:', profile);
      return profile;
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
