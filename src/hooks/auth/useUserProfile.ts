
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { toast } from "sonner";

/**
 * Fetch a user's profile from the database
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log("Fetching profile for user:", userId);
    
    // Query the profiles table directly instead of using RPC
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
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
    
    // First check if profile already exists using a direct query
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .maybeSingle();
    
    if (checkError) {
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
        phone: existingProfile.phone
      };
    }
    
    // Profile doesn't exist, create a new one using direct insert
    const newProfile: UserProfile = {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      role: 'seller' as const
    };
    
    // Fix the insert operation by properly formatting the object (not as an array)
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name,
        role: newProfile.role
      });
      
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
