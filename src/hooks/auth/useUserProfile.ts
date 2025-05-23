
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { toast } from "sonner";

/**
 * Fetch a user's profile from the database
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log("Fetching profile for user:", userId);
    
    // Query the profiles table directly
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("Profile fetch error:", error);
      return null;
    }
    
    if (data) {
      console.log("Retrieved profile:", data);
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        avatar_url: data.avatar_url,
        company: data.company,
        phone: data.phone,
        is_professional: data.is_professional || false,
        professional_headline: data.professional_headline,
        professional_bio: data.professional_bio,
        professional_firm_name: data.professional_firm_name,
        professional_contact_email: data.professional_contact_email,
        professional_phone: data.professional_phone,
        professional_website: data.professional_website,
        professional_location: data.professional_location,
        professional_specializations: data.professional_specializations || [],
        onboarding_complete: data.onboarding_complete || false,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

/**
 * Create a new user profile in the database
 */
export const createUserProfile = async (supabaseUser: any): Promise<UserProfile | null> => {
  try {
    console.log("Creating profile for user:", supabaseUser.id);
    
    // First check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
      console.error("Error checking for existing profile:", checkError);
      return null;
    }
    
    // If profile already exists, return it
    if (existingProfile) {
      console.log("Profile already exists for user, returning existing profile");
      return {
        id: existingProfile.id,
        email: existingProfile.email,
        name: existingProfile.name,
        role: existingProfile.role,
        avatar_url: existingProfile.avatar_url,
        company: existingProfile.company,
        phone: existingProfile.phone,
        is_professional: existingProfile.is_professional || false,
        professional_headline: existingProfile.professional_headline,
        professional_bio: existingProfile.professional_bio,
        professional_firm_name: existingProfile.professional_firm_name,
        professional_contact_email: existingProfile.professional_contact_email,
        professional_phone: existingProfile.professional_phone,
        professional_website: existingProfile.professional_website,
        professional_location: existingProfile.professional_location,
        professional_specializations: existingProfile.professional_specializations || [],
        onboarding_complete: existingProfile.onboarding_complete || false,
        created_at: existingProfile.created_at,
        updated_at: existingProfile.updated_at
      };
    }
    
    // Profile doesn't exist, create a new one
    const newProfileData = {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      role: 'seller' as const,
      onboarding_complete: false
    };
    
    console.log("Inserting new profile:", newProfileData);
    
    const { data: createdProfile, error: insertError } = await supabase
      .from('profiles')
      .insert(newProfileData)
      .select()
      .single();
      
    if (insertError) {
      console.error("Profile creation error:", insertError);
      toast.error(`Profile creation failed: ${insertError.message}`);
      return null;
    }
    
    if (createdProfile) {
      console.log("Created new profile for user:", createdProfile);
      return {
        id: createdProfile.id,
        email: createdProfile.email,
        name: createdProfile.name,
        role: createdProfile.role,
        avatar_url: createdProfile.avatar_url,
        company: createdProfile.company,
        phone: createdProfile.phone,
        is_professional: createdProfile.is_professional || false,
        professional_headline: createdProfile.professional_headline,
        professional_bio: createdProfile.professional_bio,
        professional_firm_name: createdProfile.professional_firm_name,
        professional_contact_email: createdProfile.professional_contact_email,
        professional_phone: createdProfile.professional_phone,
        professional_website: createdProfile.professional_website,
        professional_location: createdProfile.professional_location,
        professional_specializations: createdProfile.professional_specializations || [],
        onboarding_complete: createdProfile.onboarding_complete || false,
        created_at: createdProfile.created_at,
        updated_at: createdProfile.updated_at
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error creating user profile:", error);
    return null;
  }
};
