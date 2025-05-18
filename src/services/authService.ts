import { supabase } from "@/integrations/supabase/client";
import { User, UserProfile } from "@/types/auth";

export const authService = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return data;
  },
  
  signup: async (email: string, password: string, name?: string, options?: {
    emailRedirectTo?: string;
    data?: Record<string, any>;
  }) => {
    // We need to use the standard signUp method but make sure Supabase is configured
    // to not require email confirmation via the dashboard settings
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0], // Basic name from email if not provided
          ...options?.data
        },
        emailRedirectTo: options?.emailRedirectTo
      }
    });
    
    if (error) throw error;
    
    return data;
  },
  
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  getCurrentSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
  
  /**
   * Get current user profile with role information
   */
  getCurrentUserProfile: async (): Promise<UserProfile | null> => {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session?.user) {
      return null;
    }
    
    const userId = session.session.user.id;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, avatar_url, company, phone')
        .eq('id', userId)
        .single();
        
      if (error || !data) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      return data as UserProfile;
    } catch (error) {
      console.error("Error in getCurrentUserProfile:", error);
      return null;
    }
  },
  
  /**
   * Check if the current user has a specific role
   */
  hasRole: async (requiredRole: string): Promise<boolean> => {
    const userProfile = await authService.getCurrentUserProfile();
    if (!userProfile) return false;
    
    // For admin role, always return true
    if (userProfile.role === 'admin') return true;
    
    // Otherwise check if the user has the specific role
    return userProfile.role === requiredRole;
  }
};
