
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileHandlerState {
  loading: boolean;
  error: string | null;
  retryCount: number;
}

export const useProfileHandler = () => {
  const { user, updateUserProfile } = useAuth();
  const [state, setState] = useState<ProfileHandlerState>({
    loading: false,
    error: null,
    retryCount: 0
  });

  const ensureProfileExists = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw new Error('Failed to fetch profile');
      }

      if (existingProfile) {
        return existingProfile as UserProfile;
      }

      // Profile doesn't exist, create one
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) {
        throw new Error('No authenticated user found');
      }

      const newProfile: Partial<UserProfile> = {
        id: userId,
        email: authUser.user.email || '',
        name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'User',
        role: 'seller',
        onboarding_complete: false
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: newProfile.id!,
          email: newProfile.email!,
          name: newProfile.name!,
          role: newProfile.role!,
          onboarding_complete: newProfile.onboarding_complete!
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        throw new Error('Failed to create profile');
      }

      return createdProfile as UserProfile;
    } catch (error: any) {
      console.error('Profile handler error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message,
        retryCount: prev.retryCount + 1
      }));
      return null;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const validateProfile = useCallback((profile: UserProfile): boolean => {
    const requiredFields = ['id', 'email', 'name', 'role'];
    const missingFields = requiredFields.filter(field => !profile[field as keyof UserProfile]);
    
    if (missingFields.length > 0) {
      console.error('Profile validation failed - missing fields:', missingFields);
      setState(prev => ({ 
        ...prev, 
        error: `Profile incomplete - missing: ${missingFields.join(', ')}`
      }));
      return false;
    }
    
    return true;
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user?.profile?.id) {
      setState(prev => ({ ...prev, error: 'No user profile found' }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const updatedProfile = { ...user.profile, ...updates };
      
      if (!validateProfile(updatedProfile as UserProfile)) {
        return false;
      }

      // Build the update object with only the fields we want to update
      const updateData: Record<string, any> = {};
      
      Object.keys(updates).forEach(key => {
        if (updates[key as keyof UserProfile] !== undefined) {
          updateData[key] = updates[key as keyof UserProfile];
        }
      });

      updateData.updated_at = new Date().toISOString();

      console.log('Sending update to Supabase:', updateData);

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.profile.id);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }

      console.log('Supabase update successful, updating context...');
      const success = await updateUserProfile(updatedProfile as UserProfile);
      
      if (success) {
        console.log('Context update successful');
        setState(prev => ({ ...prev, retryCount: 0 }));
      } else {
        throw new Error('Failed to update profile in context');
      }
      
      return success;
    } catch (error: any) {
      console.error('Update profile error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message,
        retryCount: prev.retryCount + 1
      }));
      
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user, updateUserProfile, validateProfile]);

  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, retryCount: 0 }));
  }, []);

  return {
    ...state,
    ensureProfileExists,
    validateProfile,
    updateProfile,
    resetError
  };
};
