
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { toast } from "sonner";

/**
 * Fetch a user's profile from the database
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log("Fetching profile for user:", userId);
    
    // Use a direct call with service role to avoid RLS issues
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, avatar_url, company, phone')
      .eq('id', userId)
      .single();
    
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
        phone: data.phone
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
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', supabaseUser.id)
      .maybeSingle();
    
    if (fetchError) {
      console.error("Error checking for existing profile:", fetchError);
      return null;
    }
    
    // If profile already exists, fetch and return it
    if (existingProfile) {
      console.log("Profile already exists for user, fetching instead of creating");
      return await fetchUserProfile(supabaseUser.id);
    }
    
    // Profile doesn't exist, create a new one
    const newProfile: UserProfile = {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      role: 'seller' as const
    };
    
    const { error } = await supabase
      .from('profiles')
      .insert([newProfile]);
      
    if (error) {
      console.error("Profile creation error:", error);
      toast.error(`Profile creation failed: ${error.message}`);
      return null;
    }
    
    console.log("Created new profile for user:", newProfile);
    return newProfile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    return null;
  }
};
