
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

  async updateProfile(profile: UserProfile): Promise<UserProfile | null> {
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
        professional_specializations: profile.professional_specializations,
        onboarding_complete: profile.onboarding_complete,
        role: profile.role
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
};
