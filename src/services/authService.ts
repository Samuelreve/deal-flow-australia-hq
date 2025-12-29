
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  },

  async signup(email: string, password: string, name?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name: name || email.split('@')[0]
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  },

  async signInWithApple() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  },

  async updateProfile(profile: UserProfile): Promise<UserProfile | null> {
    // Ensure specializations is properly formatted as a string array
    const specializations = Array.isArray(profile.professional_specializations) 
      ? profile.professional_specializations 
      : (profile.professional_specializations ? [String(profile.professional_specializations)] : []);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        company: profile.company,
        phone: profile.phone,
        is_professional: profile.is_professional,
        professional_headline: profile.professional_headline,
        professional_bio: profile.professional_bio,
        professional_firm_name: profile.professional_firm_name,
        professional_contact_email: profile.professional_contact_email,
        professional_phone: profile.professional_phone,
        professional_website: profile.professional_website,
        professional_location: profile.professional_location,
        professional_specializations: specializations,
        onboarding_complete: profile.onboarding_complete,
        role: profile.role
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Ensure the returned profile has specializations as a string array
    if (data) {
      const formattedProfile: UserProfile = {
        ...data,
        professional_specializations: Array.isArray(data.professional_specializations)
          ? data.professional_specializations
          : data.professional_specializations 
              ? (typeof data.professional_specializations === 'string' 
                  ? [data.professional_specializations]
                  : Array.isArray(JSON.parse(JSON.stringify(data.professional_specializations)))
                    ? JSON.parse(JSON.stringify(data.professional_specializations))
                    : [])
              : []
      };
      
      return formattedProfile;
    }
    
    return null;
  }
};
