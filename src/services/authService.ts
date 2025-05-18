import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";

export const authService = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return data;
  },
  
  signup: async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0], // Basic name from email if not provided
        }
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
  getCurrentUserProfile: async (): Promise<User | null> => {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session?.user) {
      return null;
    }
    
    const userId = session.session.user.id;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, avatar')
        .eq('id', userId)
        .single();
        
      if (error || !data) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        avatar: data.avatar
      };
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
